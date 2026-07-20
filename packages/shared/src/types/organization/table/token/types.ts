export type DecodedToken = {
  organization: {
    name: string | null
    logo: string | null
    phone: string | null
    address: string | null
  }
  table: {
    name: string | null
    number: number
  }
}

export type DecodeTokenEnvelope =
  | { status: "success"; code: number; data: DecodedToken }
  | { status: "error"; code: number; message: string }
