export type DecodedToken = {
  organization: {
    id: string
    name: string
    logo: string | null
    phone: string | null
    address: string | null
  }
  table: {
    id: string
    name: string | null
    status: string
    number: number
  }
}

export type DecodeTokenEnvelope =
  | { status: "success"; code: number; data: DecodedToken }
  | { status: "error"; code: number; message: string }
