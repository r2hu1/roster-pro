"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { DnDImageInput } from "@workspace/ui/components/dnd-image-input"
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

export default function GeneralSettings() {
  const { organization } = useSession()
  const qc = useQueryClient()

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [gstin, setGstin] = useState("")
  const [hsnSac, setHsnSac] = useState("")
  const [gstRate, setGstRate] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!organization) return
    setName(organization.name ?? "")
    setPhone(organization.phone ?? "")
    setAddress(organization.address ?? "")
    setGstin(organization.gstin ?? "")
    setHsnSac(organization.hsnSac != null ? String(organization.hsnSac) : "")
    setGstRate(organization.gstRate != null ? String(organization.gstRate) : "")
  }, [organization])

  const handleLogoChange = useCallback((file: File | null) => {
    setLogoFile(file)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!organization) return

    const changed: Record<string, string | null> = {}
    if (name !== (organization.name ?? "")) changed.name = name || null
    if (phone !== (organization.phone ?? "")) changed.phone = phone || null
    if (address !== (organization.address ?? ""))
      changed.address = address || null
    if (gstin !== (organization.gstin ?? "")) changed.gstin = gstin || null

    const curHsn =
      organization.hsnSac != null ? String(organization.hsnSac) : ""
    if (hsnSac !== curHsn) changed.hsnSac = hsnSac || ""

    const curGst =
      organization.gstRate != null ? String(organization.gstRate) : ""
    if (gstRate !== curGst) changed.gstRate = gstRate || ""

    const hasTextChanges = Object.keys(changed).length > 0
    const hasLogoChange = logoFile !== null

    if (!hasTextChanges && !hasLogoChange) {
      toast.info("No changes to save")
      return
    }

    setIsSaving(true)

    try {
      const formData = new FormData()
      for (const [key, val] of Object.entries(changed)) {
        formData.append(key, val ?? "")
      }
      if (logoFile) formData.append("logo", logoFile)

      await api.put("/organization", formData)

      await qc.invalidateQueries({ queryKey: ["organizations"] })
      setLogoFile(null)
      toast.success("Settings saved")
    } catch (err) {
      const message =
        isAxiosError(err) &&
        err.response?.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
          ? String(err.response.data.message)
          : err instanceof Error
            ? err.message
            : "Failed to save settings"
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FieldGroup className="bg-card border p-4 rounded-lg">
        <Field>
          <FieldLabel>Restaurant Logo</FieldLabel>
          <FieldContent>
            <DnDImageInput
              onChange={handleLogoChange}
              defaultPreview={organization?.logo}
              previewClassName="size-40"
            />
            <FieldDescription>
              JPEG, PNG, WebP, or GIF. Recommended size: 512×512px.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>

      <FieldGroup className="bg-card border p-4 rounded-lg">
        <Field>
          <FieldLabel>Restaurant Name</FieldLabel>
          <FieldContent>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Restaurant"
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Phone</FieldLabel>
          <FieldContent>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91XXXXXXXXXX"
              type="tel"
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Address</FieldLabel>
          <FieldContent>
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full restaurant address"
              className="min-h-20"
            />
          </FieldContent>
        </Field>
      </FieldGroup>

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
        Update Details
        {isSaving && <Loader />}
      </Button>
    </form>
  )
}
