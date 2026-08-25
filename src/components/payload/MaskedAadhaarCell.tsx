import { maskAadhaar } from '../../cms/admissions/present'

export type MaskedAadhaarCellProps = Readonly<{ cellData?: unknown }>

export function MaskedAadhaarCell({ cellData }: MaskedAadhaarCellProps) {
  return <span aria-label="Masked Aadhaar number">{maskAadhaar(cellData)}</span>
}

export default MaskedAadhaarCell
