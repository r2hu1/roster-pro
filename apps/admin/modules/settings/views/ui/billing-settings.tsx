"use client"

import { useState, useEffect } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldGroup,
} from "@workspace/ui/components/field"
import { Loader } from "@workspace/ui/components/loader"
import { toast } from "sonner"
import { useSession } from "@/modules/providers/session-provider"
import { useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { isAxiosError } from "axios"

export default function BillingSettings() {
  const { organization } = useSession()
  const qc = useQueryClient()

  const [gstin, setGstin] = useState("")
  const [hsnSac, setHsnSac] = useState("")
  const [gstRate, setGstRate] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!organization) return
    setGstin(organization.gstin ?? "")
    setHsnSac(organization.hsnSac != null ? String(organization.hsnSac) : "")
    setGstRate(organization.gstRate != null ? String(organization.gstRate) : "")
  }, [organization])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!organization) return

    const changed: Record<string, string | null> = {}

    if (gstin !== (organization.gstin ?? "")) changed.gstin = gstin || null

    const curHsn =
      organization.hsnSac != null ? String(organization.hsnSac) : ""
    if (hsnSac !== curHsn) changed.hsnSac = hsnSac || ""

    const curGst =
      organization.gstRate != null ? String(organization.gstRate) : ""
    if (gstRate !== curGst) changed.gstRate = gstRate || ""

    if (Object.keys(changed).length === 0) {
      toast.info("No changes to save")
      return
    }

    setIsSaving(true)

    try {
      await api.put("/organization", changed)

      await qc.invalidateQueries({ queryKey: ["organizations"] })
      toast.success("Billing settings saved")
    } catch (err) {
      const message =
        isAxiosError(err) &&
        err.response?.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
          ? String(err.response.data.message)
          : err instanceof Error
            ? err.message
            : "Failed to save billing settings"
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FieldGroup className="bg-card border p-4 rounded-lg">
        <Field>
          <FieldLabel>GSTIN</FieldLabel>
          <FieldContent>
            <Input
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              placeholder="22AAAAA0000A1Z5"
            />
            <FieldDescription>
              Goods and Services Tax Identification Number
            </FieldDescription>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>HSN/SAC</FieldLabel>
          <FieldContent>
            <Input
              value={hsnSac}
              onChange={(e) => setHsnSac(e.target.value)}
              placeholder="996331"
              type="number"
            />
            <FieldDescription>
              Harmonized System of Nomenclature code
            </FieldDescription>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>GST Rate (%)</FieldLabel>
          <FieldContent>
            <Input
              value={gstRate}
              onChange={(e) => setGstRate(e.target.value)}
              placeholder="5"
              type="number"
              min="0"
              max="100"
            />
          </FieldContent>
        </Field>
      </FieldGroup>

      <Button type="submit" size="lg" className="float-end" disabled={isSaving}>
        Update Billing
        {isSaving && <Loader />}
      </Button>
    </form>
  )
}
