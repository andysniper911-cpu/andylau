export type Party = 'D' | 'R' | 'I' | 'O'

export type Race = {
  state: string
  office: 'senate' | 'governor'
  dem: number
  rep: number
  other: number
  demName: string
  repName: string
  otherName: string
  leaderParty: Party
  leaderName: string
  leaderPrice: number
}

export type HouseRace = {
  code: string
  state: string
  dem: number
  rep: number
  demName: string
  repName: string
}

export type EarlyState = {
  abbr: string
  voted: number
  dem: number
  rep: number
  unaffiliated: number
  mail: number
  inPerson: number
  updated: string
}

export type ControlPrice = {
  dem: number
  rep: number
  tie: number
}

export type Snapshot = {
  fetchedAt: string
  live: boolean
  senateControl: ControlPrice
  houseControl: ControlPrice
  governorControl: ControlPrice
  senateRaces: Race[]
  governorRaces: Race[]
  houseRaces: HouseRace[]
  early: EarlyState[]
}
