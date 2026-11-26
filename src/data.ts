
export type GrantStatus = "On track" | "At risk" | "Completed";

export type Grant = {
  id: string;
  organisation: string;
  programme: string;
  region: string;
  committed: number;
  disbursed: number;
  status: GrantStatus;
  startDate: string;
};

export type MonthlyFunding = {
  month: string;
  committed: number;
  disbursed: number;
};

export const grants: Grant[] = [
  {
    id: "G001",
    organisation: "Bright Futures",
    programme: "Education",
    region: "East Africa",
    committed: 250000,
    disbursed: 180000,
    status: "On track",
    startDate: "2026-01-15",
  },
  {
    id: "G002",
    organisation: "Green Earth",
    programme: "Climate",
    region: "West Africa",
    committed: 180000,
    disbursed: 150000,
    status: "On track",
    startDate: "2026-01-20",
  },
  {
    id: "G003",
    organisation: "Health First",
    programme: "Health",
    region: "East Africa",
    committed: 320000,
    disbursed: 220000,
    status: "At risk",
    startDate: "2026-02-10",
  },
  {
    id: "G004",
    organisation: "Future Skills",
    programme: "Livelihoods",
    region: "Southern Africa",
    committed: 140000,
    disbursed: 140000,
    status: "Completed",
    startDate: "2026-02-18",
  },
  {
    id: "G005",
    organisation: "Clean Water Initiative",
    programme: "Health",
    region: "West Africa",
    committed: 210000,
    disbursed: 130000,
    status: "At risk",
    startDate: "2026-03-01",
  },
  {
    id: "G006",
    organisation: "Girls Can Learn",
    programme: "Education",
    region: "East Africa",
    committed: 280000,
    disbursed: 210000,
    status: "On track",
    startDate: "2026-03-15",
  },
  {
    id: "G007",
    organisation: "Solar Communities",
    programme: "Climate",
    region: "Southern Africa",
    committed: 190000,
    disbursed: 110000,
    status: "At risk",
    startDate: "2026-04-05",
  },
  {
    id: "G008",
    organisation: "Rural Enterprise",
    programme: "Livelihoods",
    region: "West Africa",
    committed: 160000,
    disbursed: 125000,
    status: "On track",
    startDate: "2026-04-20",
  },
  {
    id: "G009",
    organisation: "Learning Together",
    programme: "Education",
    region: "West Africa",
    committed: 230000,
    disbursed: 190000,
    status: "Completed",
    startDate: "2026-05-01",
  },
  {
    id: "G010",
    organisation: "Healthy Families",
    programme: "Health",
    region: "Southern Africa",
    committed: 260000,
    disbursed: 175000,
    status: "On track",
    startDate: "2026-05-12",
  },
  {
    id: "G011",
    organisation: "Forest Futures",
    programme: "Climate",
    region: "East Africa",
    committed: 300000,
    disbursed: 200000,
    status: "At risk",
    startDate: "2026-06-02",
  },
  {
    id: "G012",
    organisation: "Women in Work",
    programme: "Livelihoods",
    region: "East Africa",
    committed: 195000,
    disbursed: 150000,
    status: "On track",
    startDate: "2026-06-15",
  },
];

export const monthlyFunding: MonthlyFunding[] = [
  { month: "Jan", committed: 420000, disbursed: 290000 },
  { month: "Feb", committed: 510000, disbursed: 340000 },
  { month: "Mar", committed: 460000, disbursed: 310000 },
  { month: "Apr", committed: 620000, disbursed: 390000 },
  { month: "May", committed: 580000, disbursed: 420000 },
  { month: "Jun", committed: 720000, disbursed: 490000 },
  { month: "Jul", committed: 650000, disbursed: 470000 },
  { month: "Aug", committed: 790000, disbursed: 550000 },
  { month: "Sep", committed: 710000, disbursed: 520000 },
  { month: "Oct", committed: 840000, disbursed: 610000 },
  { month: "Nov", committed: 760000, disbursed: 580000 },
  { month: "Dec", committed: 900000, disbursed: 680000 },
];

export const programmes = [
  { name: "Education", color: "#6675e9" },
  { name: "Climate", color: "#20a67a" },
  { name: "Health", color: "#e9a23b" },
  { name: "Livelihoods", color: "#d9778b" },
];

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);

export const formatFullCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
