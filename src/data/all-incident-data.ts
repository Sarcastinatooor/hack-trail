import { DRIFT_PROTOCOL_DATA } from "./drift-protocol"
import {
  BADGER_DATA,
  BITMART_DATA,
  CETUS_DATA,
  COMPOUND_DATA,
  CREAM_FINANCE_DATA,
  GALA_GAMES_DATA,
  HARMONY_BRIDGE_DATA,
  MANGO_MARKETS_DATA,
  MIXIN_DATA,
  MULTICHAIN_DATA,
  VULCAN_FORGED_DATA,
  WAZIRX_DATA,
  WINTERMUTE_DATA,
} from "./expanded-incidents"
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
  wazirx: WAZIRX_DATA,
  cetus: CETUS_DATA,
  "gala-games": GALA_GAMES_DATA,
  mixin: MIXIN_DATA,
  bitmart: BITMART_DATA,
  wintermute: WINTERMUTE_DATA,
  compound: COMPOUND_DATA,
  "vulcan-forged": VULCAN_FORGED_DATA,
  "cream-finance": CREAM_FINANCE_DATA,
  multichain: MULTICHAIN_DATA,
  badger: BADGER_DATA,
  "mango-markets": MANGO_MARKETS_DATA,
  "harmony-bridge": HARMONY_BRIDGE_DATA,
}
