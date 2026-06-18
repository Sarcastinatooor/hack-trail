import { DRIFT_PROTOCOL_DATA } from "./drift-protocol"
import {
  BEANSTALK_DATA,
  BNB_BRIDGE_DATA,
  EULER_FINANCE_DATA,
  NOMAD_BRIDGE_DATA,
  POLY_NETWORK_DATA,
  RONIN_BRIDGE_DATA,
  WORMHOLE_DATA,
} from "./historical-incidents"
import { KELP_DAO_DATA } from "./kelp-dao"
import type { IncidentData } from "./types"
import { ZCASH_ORCHARD_DATA } from "./zcash-orchard"

export const INCIDENT_DATA_BY_SLUG: Record<string, IncidentData> = {
  "kelp-dao": KELP_DAO_DATA,
  "zcash-orchard": ZCASH_ORCHARD_DATA,
  "drift-protocol": DRIFT_PROTOCOL_DATA,
  "ronin-bridge": RONIN_BRIDGE_DATA,
  "poly-network": POLY_NETWORK_DATA,
  "bnb-bridge": BNB_BRIDGE_DATA,
  wormhole: WORMHOLE_DATA,
  "euler-finance": EULER_FINANCE_DATA,
  "nomad-bridge": NOMAD_BRIDGE_DATA,
  beanstalk: BEANSTALK_DATA,
}
