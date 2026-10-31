export type StateMeta = {
  abbr: string
  en: string
  zh: string
  fips: string
  governor: boolean
}

export const STATE_LIST: StateMeta[] = [
  { abbr: 'AL', en: 'Alabama', zh: '阿拉巴马', fips: '01', governor: true },
  { abbr: 'AK', en: 'Alaska', zh: '阿拉斯加', fips: '02', governor: true },
  { abbr: 'AZ', en: 'Arizona', zh: '亚利桑那', fips: '04', governor: true },
  { abbr: 'AR', en: 'Arkansas', zh: '阿肯色', fips: '05', governor: true },
  { abbr: 'CA', en: 'California', zh: '加利福尼亚', fips: '06', governor: true },
  { abbr: 'CO', en: 'Colorado', zh: '科罗拉多', fips: '08', governor: true },
  { abbr: 'CT', en: 'Connecticut', zh: '康涅狄格', fips: '09', governor: true },
  { abbr: 'DE', en: 'Delaware', zh: '特拉华', fips: '10', governor: false },
  { abbr: 'DC', en: 'District of Columbia', zh: '华盛顿特区', fips: '11', governor: false },
  { abbr: 'FL', en: 'Florida', zh: '佛罗里达', fips: '12', governor: true },
  { abbr: 'GA', en: 'Georgia', zh: '佐治亚', fips: '13', governor: true },
  { abbr: 'HI', en: 'Hawaii', zh: '夏威夷', fips: '15', governor: true },
  { abbr: 'ID', en: 'Idaho', zh: '爱达荷', fips: '16', governor: true },
  { abbr: 'IL', en: 'Illinois', zh: '伊利诺伊', fips: '17', governor: true },
  { abbr: 'IN', en: 'Indiana', zh: '印第安纳', fips: '18', governor: false },
  { abbr: 'IA', en: 'Iowa', zh: '艾奥瓦', fips: '19', governor: true },
  { abbr: 'KS', en: 'Kansas', zh: '堪萨斯', fips: '20', governor: true },
  { abbr: 'KY', en: 'Kentucky', zh: '肯塔基', fips: '21', governor: false },
  { abbr: 'LA', en: 'Louisiana', zh: '路易斯安那', fips: '22', governor: false },
  { abbr: 'ME', en: 'Maine', zh: '缅因', fips: '23', governor: true },
  { abbr: 'MD', en: 'Maryland', zh: '马里兰', fips: '24', governor: true },
  { abbr: 'MA', en: 'Massachusetts', zh: '马萨诸塞', fips: '25', governor: true },
  { abbr: 'MI', en: 'Michigan', zh: '密歇根', fips: '26', governor: true },
  { abbr: 'MN', en: 'Minnesota', zh: '明尼苏达', fips: '27', governor: true },
  { abbr: 'MS', en: 'Mississippi', zh: '密西西比', fips: '28', governor: false },
  { abbr: 'MO', en: 'Missouri', zh: '密苏里', fips: '29', governor: false },
  { abbr: 'MT', en: 'Montana', zh: '蒙大拿', fips: '30', governor: false },
  { abbr: 'NE', en: 'Nebraska', zh: '内布拉斯加', fips: '31', governor: true },
  { abbr: 'NV', en: 'Nevada', zh: '内华达', fips: '32', governor: true },
  { abbr: 'NH', en: 'New Hampshire', zh: '新罕布什尔', fips: '33', governor: true },
  { abbr: 'NJ', en: 'New Jersey', zh: '新泽西', fips: '34', governor: false },
  { abbr: 'NM', en: 'New Mexico', zh: '新墨西哥', fips: '35', governor: true },
  { abbr: 'NY', en: 'New York', zh: '纽约', fips: '36', governor: true },
  { abbr: 'NC', en: 'North Carolina', zh: '北卡罗来纳', fips: '37', governor: false },
  { abbr: 'ND', en: 'North Dakota', zh: '北达科他', fips: '38', governor: false },
  { abbr: 'OH', en: 'Ohio', zh: '俄亥俄', fips: '39', governor: true },
  { abbr: 'OK', en: 'Oklahoma', zh: '俄克拉荷马', fips: '40', governor: true },
  { abbr: 'OR', en: 'Oregon', zh: '俄勒冈', fips: '41', governor: true },
  { abbr: 'PA', en: 'Pennsylvania', zh: '宾夕法尼亚', fips: '42', governor: true },
  { abbr: 'RI', en: 'Rhode Island', zh: '罗德岛', fips: '44', governor: true },
  { abbr: 'SC', en: 'South Carolina', zh: '南卡罗来纳', fips: '45', governor: true },
  { abbr: 'SD', en: 'South Dakota', zh: '南达科他', fips: '46', governor: true },
  { abbr: 'TN', en: 'Tennessee', zh: '田纳西', fips: '47', governor: true },
  { abbr: 'TX', en: 'Texas', zh: '得克萨斯', fips: '48', governor: true },
  { abbr: 'UT', en: 'Utah', zh: '犹他', fips: '49', governor: false },
  { abbr: 'VT', en: 'Vermont', zh: '佛蒙特', fips: '50', governor: true },
  { abbr: 'VA', en: 'Virginia', zh: '弗吉尼亚', fips: '51', governor: false },
  { abbr: 'WA', en: 'Washington', zh: '华盛顿', fips: '53', governor: false },
  { abbr: 'WV', en: 'West Virginia', zh: '西弗吉尼亚', fips: '54', governor: false },
  { abbr: 'WI', en: 'Wisconsin', zh: '威斯康星', fips: '55', governor: true },
  { abbr: 'WY', en: 'Wyoming', zh: '怀俄明', fips: '56', governor: true },
]

export const STATE_BY_ABBR = Object.fromEntries(STATE_LIST.map((state) => [state.abbr, state]))
export const STATE_BY_NAME = Object.fromEntries(STATE_LIST.map((state) => [state.en, state.abbr]))

export const GOVERNOR_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'FL', 'GA', 'HI', 'ID', 'IL', 'IA', 'KS',
  'ME', 'MD', 'MA', 'MI', 'MN', 'NE', 'NV', 'NH', 'NM', 'NY', 'OH', 'OK', 'OR', 'PA',
  'RI', 'SC', 'SD', 'TN', 'TX', 'VT', 'WI', 'WY',
]

/** Class 2 seats plus the Florida and Ohio specials. Incumbent party is the pre-election holder. */
export const SENATE_UP: { abbr: string; incumbent: 'D' | 'R' }[] = [
  { abbr: 'AL', incumbent: 'R' },
  { abbr: 'AK', incumbent: 'R' },
  { abbr: 'AR', incumbent: 'R' },
  { abbr: 'CO', incumbent: 'D' },
  { abbr: 'DE', incumbent: 'D' },
  { abbr: 'FL', incumbent: 'R' },
  { abbr: 'GA', incumbent: 'D' },
  { abbr: 'ID', incumbent: 'R' },
  { abbr: 'IL', incumbent: 'D' },
  { abbr: 'IA', incumbent: 'R' },
  { abbr: 'KS', incumbent: 'R' },
  { abbr: 'KY', incumbent: 'R' },
  { abbr: 'LA', incumbent: 'R' },
  { abbr: 'ME', incumbent: 'R' },
  { abbr: 'MA', incumbent: 'D' },
  { abbr: 'MI', incumbent: 'D' },
  { abbr: 'MN', incumbent: 'D' },
  { abbr: 'MS', incumbent: 'R' },
  { abbr: 'MT', incumbent: 'R' },
  { abbr: 'NE', incumbent: 'R' },
  { abbr: 'NH', incumbent: 'D' },
  { abbr: 'NJ', incumbent: 'D' },
  { abbr: 'NM', incumbent: 'D' },
  { abbr: 'NC', incumbent: 'R' },
  { abbr: 'OH', incumbent: 'R' },
  { abbr: 'OK', incumbent: 'R' },
  { abbr: 'OR', incumbent: 'D' },
  { abbr: 'RI', incumbent: 'D' },
  { abbr: 'SC', incumbent: 'R' },
  { abbr: 'SD', incumbent: 'R' },
  { abbr: 'TN', incumbent: 'R' },
  { abbr: 'TX', incumbent: 'R' },
  { abbr: 'VA', incumbent: 'D' },
  { abbr: 'WV', incumbent: 'R' },
  { abbr: 'WY', incumbent: 'R' },
]

export const SENATE_NOT_UP = { dem: 32, independentCaucus: 2, rep: 31 }

export const NORTHEAST_CALLOUTS = ['VT', 'NH', 'MA', 'RI', 'CT', 'NJ', 'DE', 'MD']

export const ELECTION_START = new Date('2026-11-03T05:00:00Z')
