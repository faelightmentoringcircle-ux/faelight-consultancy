// =====================================================================
// Client List & Contacts — seed data (from the Notion export). Seeds the
// local store; managed from /admin/clients. Admin-only (not public).
// =====================================================================

import type { ClientContact } from "./store";

export const CLIENT_SEED: Omit<ClientContact, "archived">[] = [
  {
    "id": "cl-01",
    "name": "David Stevens",
    "company": "5MD Designs",
    "role": "Founder/CEO",
    "email": "david@5MDDesign.com",
    "phone": "",
    "bizPhone": "",
    "country": "Australia",
    "industry": "Manufacturing",
    "leadSource": "Business Contact",
    "website": "https://www.carbonxscycles.com",
    "whois": "High End Bikes for kids",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "5MD Designs -CarbonXS - Full EVA and Marketing Stack"
    ]
  },
  {
    "id": "cl-02",
    "name": "Cap Hernandez",
    "company": "Uncapped Digital",
    "role": "Founder/CEO",
    "email": "cap@uncapped.asia",
    "phone": "",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "Training/Biz Coaches",
    "leadSource": "BNI",
    "website": "https://uncapped.asia/#founder",
    "whois": "#1 LinkedIn Coach in Asia",
    "contractSigned": true,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "Uncapped SMART Collab"
    ]
  },
  {
    "id": "cl-03",
    "name": "JC Santos",
    "company": "Speech Coach",
    "role": "Founder/CEO",
    "email": "",
    "phone": "",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "Training/Biz Coaches",
    "leadSource": "BNI",
    "website": "https://speechcoachgroup.info",
    "whois": "#1 Speech Coach in Asia",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "Speech Coach",
      "Untitled"
    ]
  },
  {
    "id": "cl-04",
    "name": "JC Calvento",
    "company": "Ultra Manpower Services",
    "role": "Founder/CEO",
    "email": "jc@ultramanpowers",
    "phone": "+63 917 576 7726",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "Manpower",
    "leadSource": "BNI",
    "website": "http://www.ultramanpower.ph",
    "whois": "",
    "contractSigned": true,
    "signedDocUrl": "https://drive.google.com/file/d/1dDyZoxFo6dH86sXTFz2V9F8940fAQgxT/view?usp=drive_link",
    "contractorDoc": "",
    "projects": [
      "Ultra Manpower Solutions"
    ]
  },
  {
    "id": "cl-05",
    "name": "Virgil Alvarez",
    "company": "Mean Bean",
    "role": "Founder/CEO",
    "email": "iambordo@gmail.com",
    "phone": "+639177795228",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "Food and Beverage",
    "leadSource": "Referral",
    "website": "",
    "whois": "",
    "contractSigned": true,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "Mean Bean Coffee"
    ]
  },
  {
    "id": "cl-06",
    "name": "Remoworks",
    "company": "Remoworks International LLC",
    "role": "CEO . Founder",
    "email": "doc.opulencia@remoworks.com",
    "phone": "",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "Virtual Assistant Services",
    "leadSource": "BNI",
    "website": "remoworks.com",
    "whois": "",
    "contractSigned": true,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "Remoworks"
    ]
  },
  {
    "id": "cl-07",
    "name": "Melboy Pangan",
    "company": "Zolomon AI",
    "role": "Founder/CEO",
    "email": "",
    "phone": "",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "AI",
    "leadSource": "BNI",
    "website": "https://zolomonai.com/",
    "whois": "",
    "contractSigned": true,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "Zolomon AI"
    ]
  },
  {
    "id": "cl-08",
    "name": "Rummel Cabangbang",
    "company": "Celestial",
    "role": "Founder/CEO",
    "email": "",
    "phone": "",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "Security Services",
    "leadSource": "BNI",
    "website": "https://celestial-security.com/",
    "whois": "",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "Celestial - Complete Notion 4 Days"
    ]
  },
  {
    "id": "cl-09",
    "name": "Krille Lannnon",
    "company": "DC Creatives",
    "role": "Founder/CEO",
    "email": "dccreatives00@gmail.com",
    "phone": "09267253335",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "Digital Marketing",
    "leadSource": "BNI",
    "website": "https://dccreativesmarketingagency.com/",
    "whois": "",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "DC Creatives",
      "DC Creatives"
    ]
  },
  {
    "id": "cl-10",
    "name": "Tonet Reyes",
    "company": "ATR",
    "role": "",
    "email": "",
    "phone": "",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "",
    "leadSource": "BNI",
    "website": "https://atr-rarr.ph/",
    "whois": "",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "ATR Trading"
    ]
  },
  {
    "id": "cl-11",
    "name": "Maia Castaneda",
    "company": "Faelight Business Consultancy",
    "role": "",
    "email": "",
    "phone": "",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "",
    "leadSource": "BNI",
    "website": "https://www.facebook.com/faelightmentoringcircle/",
    "whois": "",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "Uncapped SMART Collab"
    ]
  },
  {
    "id": "cl-12",
    "name": "Alfonso Robalin",
    "company": "Donald Mooney Enterprises",
    "role": "",
    "email": "arobalin@dmooneyllc.com",
    "phone": "",
    "bizPhone": "",
    "country": "United States - LA",
    "industry": "",
    "leadSource": "Referral",
    "website": "https://dmooneyllc.com/",
    "whois": "",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "Donald Mooney Enterprises"
    ]
  },
  {
    "id": "cl-13",
    "name": "Twyla David",
    "company": "CEO",
    "role": "",
    "email": "",
    "phone": "",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "",
    "leadSource": "Referral",
    "website": "https://plan-international.org/philippines/",
    "whois": "",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "Plan International"
    ]
  },
  {
    "id": "cl-14",
    "name": "Nevin Santos",
    "company": "NS+P architecture",
    "role": "Founder CEO",
    "email": "nsparchitecture@gmail.com",
    "phone": "",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "",
    "leadSource": "BNI",
    "website": "https://www.facebook.com/nsparchi",
    "whois": "",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "NSP Architecture",
      "Untitled"
    ]
  },
  {
    "id": "cl-15",
    "name": "Atty Vann Dela Cruz",
    "company": "Dela Cruz & Cruz Law",
    "role": "",
    "email": "",
    "phone": "",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "",
    "leadSource": "BNI",
    "website": "https://dcclaw.ph/?fbclid=IwY2xjawTWb7ZleHRuA2FlbQIxMABicmlkETExbUhkbFZSWGNLTEJibHk1c3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHi1mTwHszo7ybRf99Gik8eyZ5HU78pmOMgB2lZ--0-WjikXuN1BRUSQCVo9D_aem_s_rHq-iSmmaPIrXb14lt0Q",
    "whois": "",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "Dela Cruz Law Training"
    ]
  },
  {
    "id": "cl-16",
    "name": "Larry Ulep",
    "company": "Eco Struktura",
    "role": "",
    "email": "",
    "phone": "",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "",
    "leadSource": "BNI",
    "website": "https://ecostruktura.org/",
    "whois": "",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": []
  },
  {
    "id": "cl-17",
    "name": "Agnes Gervacio",
    "company": "Connected Women",
    "role": "",
    "email": "",
    "phone": "",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "",
    "leadSource": "Referral",
    "website": "https://connectedwomen.com/",
    "whois": "",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "Connected Women",
      "connected women faelight experiences"
    ]
  },
  {
    "id": "cl-18",
    "name": "Jechris Olaya",
    "company": "MiraCeti Guides Inc",
    "role": "Partner of MiraCeti",
    "email": "Jek@miracetiguidesinc.com",
    "phone": "",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "",
    "leadSource": "BNI",
    "website": "https://miracetiguidesinc.com/",
    "whois": "",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "MiraCeti Digital Agency"
    ]
  },
  {
    "id": "cl-19",
    "name": "Alvin Sta Ana",
    "company": "Simply Accounting",
    "role": "",
    "email": "Almstaana@gmail.com",
    "phone": "",
    "bizPhone": "+63822512296",
    "country": "Philippines",
    "industry": "",
    "leadSource": "BNI",
    "website": "https://simplyaccountingph.com/",
    "whois": "",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "Simply Accounting - Training Modules"
    ]
  },
  {
    "id": "cl-20",
    "name": "Maps Pangan",
    "company": "Maps Pangan",
    "role": "Solo Preneur",
    "email": "",
    "phone": "",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "",
    "leadSource": "BNI",
    "website": "https://www.facebook.com/maps.pangan/",
    "whois": "",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "Herbalife- Maps - System"
    ]
  },
  {
    "id": "cl-21",
    "name": "SMART VA",
    "company": "Smart VA Platform",
    "role": "",
    "email": "",
    "phone": "",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "",
    "leadSource": "BNI",
    "website": "",
    "whois": "",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "Uncapped SMART Collab",
      "SMART VA COLLAB TRACKER"
    ]
  },
  {
    "id": "cl-22",
    "name": "BNI Progress",
    "company": "",
    "role": "",
    "email": "",
    "phone": "",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "",
    "leadSource": "BNI",
    "website": "https://laspinas.bni.ph/bniprogressmnlsouth/en-PH/index",
    "whois": "",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "BNI ProgreSS"
    ]
  },
  {
    "id": "cl-23",
    "name": "Jason Carillo",
    "company": "",
    "role": "",
    "email": "",
    "phone": "",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "",
    "leadSource": "",
    "website": "https://www.facebook.com/SajalizedTrainingSolutions",
    "whois": "",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": [
      "Sajalized Trading"
    ]
  },
  {
    "id": "cl-24",
    "name": "VANTIS",
    "company": "Vantis",
    "role": "",
    "email": "",
    "phone": "",
    "bizPhone": "",
    "country": "Philippines",
    "industry": "",
    "leadSource": "",
    "website": "https://www.vantis.ph/",
    "whois": "",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": []
  },
  {
    "id": "cl-26",
    "name": "Prue Oswin",
    "company": "Sidelines Traffice",
    "role": "Solopreneur",
    "email": "",
    "phone": "",
    "bizPhone": "",
    "country": "Australia",
    "industry": "Traffic Engineering",
    "leadSource": "Referral",
    "website": "",
    "whois": "",
    "contractSigned": true,
    "signedDocUrl": "",
    "contractorDoc": "Faelight_Nadiah_Managed_Talent_Agreement_FINAL_Signed.pdf",
    "projects": [
      "Sidelines Traffic"
    ]
  },
  {
    "id": "cl-27",
    "name": "Mica Fanlo",
    "company": "VIDEOSONIC",
    "role": "",
    "email": "",
    "phone": "",
    "bizPhone": "",
    "country": "",
    "industry": "",
    "leadSource": "",
    "website": "",
    "whois": "",
    "contractSigned": false,
    "signedDocUrl": "",
    "contractorDoc": "",
    "projects": []
  }
];
