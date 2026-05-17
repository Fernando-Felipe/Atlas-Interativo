/* Dados militares estáticos — fontes: SIPRI 2024, Global Firepower 2024, Wikipedia.
   Estrutura por ISO3:
     gfpRank   – ranking Global Firepower 2024
     budget    – orçamento de defesa em bilhões USD
     personnel – efetivo ativo
     nuclear   – { active, total } ou null
     missiles  – [{ name, range (km), type }] ordenado por alcance desc  */

window.MILITARY_DATA = {
  USA: { gfpRank:1,  budget:886, personnel:1395350, nuclear:{active:1670,total:5550}, missiles:[
    {name:'Minuteman III',     range:13000, type:'ICBM'},
    {name:'Trident II D5',     range:12000, type:'SLBM'},
    {name:'Tomahawk BGM-109',  range:2500,  type:'Cruzeiro'},
    {name:'AGM-158 JASSM-ER',  range:925,   type:'Cruzeiro'},
  ]},
  RUS: { gfpRank:2,  budget:109, personnel:1320000, nuclear:{active:1674,total:6257}, missiles:[
    {name:'RS-28 Sarmat',      range:18000, type:'ICBM'},
    {name:'R-36M2 Voevoda',    range:16000, type:'ICBM'},
    {name:'Kh-101',            range:5500,  type:'Cruzeiro'},
    {name:'Kinzhal',           range:2000,  type:'Hipersônico'},
    {name:'Iskander-M',        range:500,   type:'Balístico'},
  ]},
  CHN: { gfpRank:3,  budget:224, personnel:2185000, nuclear:{active:350,total:500}, missiles:[
    {name:'DF-41',             range:15000, type:'ICBM'},
    {name:'DF-5B',             range:13000, type:'ICBM'},
    {name:'DF-26',             range:4000,  type:'IRBM'},
    {name:'CJ-10',             range:2000,  type:'Cruzeiro'},
    {name:'DF-21D',            range:1500,  type:'Anti-navio'},
  ]},
  IND: { gfpRank:4,  budget:81,  personnel:1455550, nuclear:{active:160,total:172}, missiles:[
    {name:'Agni-V',            range:8000,  type:'ICBM'},
    {name:'Agni-III',          range:3500,  type:'IRBM'},
    {name:'BrahMos',           range:450,   type:'Cruzeiro'},
  ]},
  KOR: { gfpRank:5,  budget:47,  personnel:600000,  nuclear:null, missiles:[
    {name:'Hyunmoo-3C',        range:1500,  type:'Cruzeiro'},
    {name:'Hyunmoo-4',         range:800,   type:'Balístico'},
  ]},
  GBR: { gfpRank:6,  budget:68,  personnel:194000,  nuclear:{active:120,total:225}, missiles:[
    {name:'Trident II D5',     range:12000, type:'SLBM'},
    {name:'Storm Shadow',      range:560,   type:'Cruzeiro'},
  ]},
  JPN: { gfpRank:7,  budget:51,  personnel:247150,  nuclear:null, missiles:[
    {name:'Type 12 (mod.)',    range:1200,  type:'Anti-navio'},
    {name:'JSM',               range:500,   type:'Cruzeiro'},
  ]},
  TUR: { gfpRank:8,  budget:18,  personnel:355200,  nuclear:null, missiles:[
    {name:'SOM-J',             range:500,   type:'Cruzeiro'},
    {name:'Bora',              range:280,   type:'Balístico'},
  ]},
  PAK: { gfpRank:9,  budget:10,  personnel:654000,  nuclear:{active:165,total:170}, missiles:[
    {name:'Shaheen-3',         range:2750,  type:'MRBM'},
    {name:'Ghauri',            range:1500,  type:'MRBM'},
    {name:'Babur',             range:700,   type:'Cruzeiro'},
  ]},
  ITA: { gfpRank:10, budget:29,  personnel:170000,  nuclear:null, missiles:[
    {name:'Storm Shadow',      range:560,   type:'Cruzeiro'},
    {name:'Aster 30',          range:120,   type:'Defesa Aérea'},
  ]},
  FRA: { gfpRank:11, budget:56,  personnel:203250,  nuclear:{active:280,total:290}, missiles:[
    {name:'M51',               range:10000, type:'SLBM'},
    {name:'ASMP-A',            range:500,   type:'Cruzeiro Nuclear'},
    {name:'Storm Shadow',      range:560,   type:'Cruzeiro'},
  ]},
  BRA: { gfpRank:12, budget:20,  personnel:366500,  nuclear:null, missiles:[
    {name:'AV-TM 300',         range:300,   type:'Cruzeiro'},
    {name:'Astros II MLRS',    range:300,   type:'Foguete'},
  ]},
  AUS: { gfpRank:13, budget:33,  personnel:60000,   nuclear:null, missiles:[
    {name:'Tomahawk',          range:2500,  type:'Cruzeiro'},
    {name:'AGM-158C LRASM',    range:370,   type:'Anti-navio'},
  ]},
  IRN: { gfpRank:14, budget:10,  personnel:610000,  nuclear:null, missiles:[
    {name:'Khorramshahr-4',    range:2000,  type:'MRBM'},
    {name:'Shahab-3',          range:2000,  type:'MRBM'},
    {name:'Fateh-313',         range:500,   type:'Balístico'},
  ]},
  EGY: { gfpRank:15, budget:4,   personnel:438500,  nuclear:null, missiles:[
    {name:'Scud-D',            range:700,   type:'Balístico'},
    {name:'Fateh-110',         range:300,   type:'Balístico'},
  ]},
  SAU: { gfpRank:16, budget:75,  personnel:257000,  nuclear:null, missiles:[
    {name:'CSS-2 (DF-3A)',     range:2800,  type:'IRBM'},
    {name:'CSS-5 (DF-21)',     range:1700,  type:'MRBM'},
  ]},
  ISR: { gfpRank:17, budget:24,  personnel:170000,  nuclear:{active:90,total:90}, missiles:[
    {name:'Jericho III',       range:6500,  type:'ICBM'},
    {name:'Popeye Turbo',      range:1500,  type:'Cruzeiro'},
    {name:'Jericho II',        range:1500,  type:'MRBM'},
  ]},
  UKR: { gfpRank:18, budget:65,  personnel:900000,  nuclear:null, missiles:[
    {name:'Storm Shadow',      range:560,   type:'Cruzeiro'},
    {name:'Neptun',            range:280,   type:'Anti-navio'},
  ]},
  DEU: { gfpRank:19, budget:67,  personnel:183500,  nuclear:null, missiles:[
    {name:'Taurus KEPD 350',   range:500,   type:'Cruzeiro'},
    {name:'IRIS-T SLM',        range:40,    type:'Defesa Aérea'},
  ]},
  POL: { gfpRank:20, budget:30,  personnel:190000,  nuclear:null, missiles:[
    {name:'AGM-158 JASSM',     range:370,   type:'Cruzeiro'},
    {name:'Homar-K',           range:300,   type:'MLRS'},
  ]},
  TWN: { gfpRank:21, budget:19,  personnel:169000,  nuclear:null, missiles:[
    {name:'Hsiung Feng IIE',   range:1200,  type:'Cruzeiro'},
    {name:'Hsiung Feng III',   range:400,   type:'Anti-navio'},
  ]},
  SGP: { gfpRank:22, budget:13,  personnel:72500,   nuclear:null, missiles:[
    {name:'Spike NLOS',        range:25,    type:'Antitanque'},
  ]},
  ESP: { gfpRank:23, budget:19,  personnel:120000,  nuclear:null, missiles:[
    {name:'Storm Shadow',      range:560,   type:'Cruzeiro'},
    {name:'Taurus KEPD 350',   range:500,   type:'Cruzeiro'},
  ]},
  VNM: { gfpRank:24, budget:7,   personnel:482000,  nuclear:null, missiles:[
    {name:'Bastion-P',         range:300,   type:'Anti-navio'},
    {name:'Kh-35',             range:250,   type:'Anti-navio'},
  ]},
  THA: { gfpRank:25, budget:7,   personnel:360850,  nuclear:null, missiles:[
    {name:'C-802A',            range:180,   type:'Anti-navio'},
  ]},
  DZA: { gfpRank:26, budget:9,   personnel:317000,  nuclear:null, missiles:[
    {name:'Scud-B',            range:300,   type:'Balístico'},
    {name:'S-300 PMU2',        range:200,   type:'Defesa Aérea'},
  ]},
  CAN: { gfpRank:27, budget:26,  personnel:68000,   nuclear:null, missiles:[
    {name:'Tomahawk',          range:2500,  type:'Cruzeiro'},
    {name:'AGM-65 Maverick',   range:27,    type:'Tático'},
  ]},
  NLD: { gfpRank:28, budget:22,  personnel:40000,   nuclear:null, missiles:[
    {name:'Tomahawk',          range:2500,  type:'Cruzeiro'},
    {name:'Harpoon',           range:280,   type:'Anti-navio'},
  ]},
  GRC: { gfpRank:30, budget:7,   personnel:142300,  nuclear:null, missiles:[
    {name:'Storm Shadow',      range:560,   type:'Cruzeiro'},
    {name:'Harpoon',           range:280,   type:'Anti-navio'},
  ]},
  PRK: { gfpRank:34, budget:4,   personnel:1280000, nuclear:{active:40,total:50}, missiles:[
    {name:'Hwasong-17',        range:15000, type:'ICBM'},
    {name:'Hwasong-12',        range:4500,  type:'IRBM'},
    {name:'KN-23',             range:690,   type:'Balístico'},
  ]},
  ARE: { gfpRank:33, budget:22,  personnel:63000,   nuclear:null, missiles:[
    {name:'SCALP-EG',          range:560,   type:'Cruzeiro'},
    {name:'Sky Dragon 50',     range:50,    type:'Defesa Aérea'},
  ]},
  MAR: { gfpRank:29, budget:5,   personnel:196300,  nuclear:null, missiles:[
    {name:'ATACMS',            range:300,   type:'Balístico'},
    {name:'Harpoon',           range:280,   type:'Anti-navio'},
  ]},
  ARG: { gfpRank:31, budget:3,   personnel:73000,   nuclear:null, missiles:[
    {name:'Cóndor II',         range:800,   type:'Balístico'},
  ]},
  ZAF: { gfpRank:32, budget:3,   personnel:78000,   nuclear:null, missiles:[
    {name:'Umkhonto-R',        range:20,    type:'Defesa Aérea'},
  ]},
  NOR: { gfpRank:35, budget:10,  personnel:24000,   nuclear:null, missiles:[
    {name:'JSM',               range:500,   type:'Cruzeiro'},
    {name:'NSM',               range:185,   type:'Anti-navio'},
  ]},
  SWE: { gfpRank:36, budget:10,  personnel:25000,   nuclear:null, missiles:[
    {name:'Taurus KEPD 350',   range:500,   type:'Cruzeiro'},
    {name:'RBS-15 Mk4',        range:250,   type:'Anti-navio'},
  ]},
  FIN: { gfpRank:37, budget:7,   personnel:23000,   nuclear:null, missiles:[
    {name:'AGM-158 JASSM-ER',  range:925,   type:'Cruzeiro'},
    {name:'RBS-15 Mk3',        range:250,   type:'Anti-navio'},
  ]},
  NGA: { gfpRank:38, budget:3,   personnel:223000,  nuclear:null, missiles:[
    {name:'BM-21 Grad',        range:40,    type:'Foguete'},
  ]},
  BGD: { gfpRank:39, budget:4,   personnel:160000,  nuclear:null, missiles:[
    {name:'C-802A',            range:180,   type:'Anti-navio'},
  ]},
  MMR: { gfpRank:40, budget:3,   personnel:406000,  nuclear:null, missiles:[
    {name:'Fateh-110',         range:300,   type:'Balístico'},
  ]},
  IDN: { gfpRank:13, budget:10,  personnel:395500,  nuclear:null, missiles:[
    {name:'BrahMos',           range:450,   type:'Cruzeiro'},
    {name:'C-705',             range:170,   type:'Anti-navio'},
  ]},
  MEX: { gfpRank:31, budget:11,  personnel:277150,  nuclear:null, missiles:[
    {name:'AGM-65 Maverick',   range:27,    type:'Tático'},
  ]},
  MYS: { gfpRank:41, budget:4,   personnel:113000,  nuclear:null, missiles:[
    {name:'Harpoon',           range:280,   type:'Anti-navio'},
  ]},
  PHL: { gfpRank:42, budget:5,   personnel:145000,  nuclear:null, missiles:[
    {name:'BrahMos',           range:450,   type:'Cruzeiro'},
  ]},
  IRQ: { gfpRank:43, budget:7,   personnel:200000,  nuclear:null, missiles:[
    {name:'Al-Fatah',          range:200,   type:'Balístico'},
  ]},
};

/* Cor por categoria de míssil (RGB sólido — opacidade aplicada na hora) */
window.MISSILE_COLORS = {
  'ICBM':             '#FF3C3C',
  'SLBM':             '#FF7A00',
  'IRBM':             '#FFD700',
  'MRBM':             '#FFD700',
  'Hipersônico':      '#C850FF',
  'Cruzeiro':         '#6FE3FF',
  'Cruzeiro Nuclear': '#FF3C3C',
  'Balístico':        '#50FF90',
  'Anti-navio':       '#4CA3FF',
  'Defesa Aérea':     '#C0C0C0',
  'MLRS':             '#FFA040',
  'Foguete':          '#FFA040',
  'Tático':           '#A0E080',
  'Ar-Ar':            '#80D4FF',
  'Antitanque':       '#C8A060',
};
