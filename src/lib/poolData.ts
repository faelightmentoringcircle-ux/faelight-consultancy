// =====================================================================
// Faelight Pool — VA talent-pool seed data (imported from the Notion
// "Current Faelight Pool" export). Seeds the local store on first load;
// in production this lives in the database and is managed from /admin/pool.
// =====================================================================

import type { PoolVA } from "./store";

export const POOL_SEED: Omit<PoolVA, "archived">[] = [
  {
    "id": "va-01",
    "name": "Elyssa Perez",
    "niche": [
      "Administrative Support",
      "Content Creation",
      "Customer Support",
      "Data Entry",
      "Executive Virtual Assistance",
      "Graphic Design",
      "Marketing Support",
      "Operations Support",
      "Project Management",
      "Social Media",
      "Video Editing",
      "Website Creation"
    ],
    "cv": "https://drive.google.com/file/d/1T6OZAJiXRg0S9OebmKIj-etUy9GX52DM/view?usp=sharing",
    "website": "https://linktr.ee/elyxonia",
    "email": "elyssaperez.ep@gmail.com",
    "phone": "0929 3204 386",
    "deployedTo": "Mr. Virgil Alvarez",
    "deployment": "Part Time",
    "status": "Top Deployment",
    "projects": [
      "Mean Bean Coffee",
      "Ultra Manpower Solutions",
      "Faelight Mentoring Circle"
    ],
    "notes": "",
    "batch": "",
    "active": true
  },
  {
    "id": "va-02",
    "name": "Almon John Cledera",
    "niche": [
      "Administrative Support",
      "Website Creation"
    ],
    "cv": "",
    "website": "",
    "email": "",
    "phone": "",
    "deployedTo": "",
    "deployment": "Part Time",
    "status": "Top Deployment",
    "projects": [
      "Remoworks",
      "Uncapped Digital"
    ],
    "notes": "",
    "batch": "",
    "active": true
  },
  {
    "id": "va-03",
    "name": "Mark Christian Crespo",
    "niche": [
      "Animation",
      "Graphic Design"
    ],
    "cv": "https://drive.google.com/drive/folders/1xYpNmDAV-HGoG7qMCPBvcK9_jHw84fEf?usp=sharing",
    "website": "",
    "email": "",
    "phone": "",
    "deployedTo": "",
    "deployment": "",
    "status": "Needs Guidance",
    "projects": [],
    "notes": "",
    "batch": "",
    "active": true
  },
  {
    "id": "va-04",
    "name": "Kueenie Aranas",
    "niche": [
      "Graphic Design"
    ],
    "cv": "",
    "website": "",
    "email": "",
    "phone": "",
    "deployedTo": "",
    "deployment": "",
    "status": "Needs Guidance",
    "projects": [],
    "notes": "",
    "batch": "",
    "active": true
  },
  {
    "id": "va-05",
    "name": "Red Vasquez",
    "niche": [
      "Graphic Design",
      "Marketing Support",
      "Video Editing",
      "Website Creation"
    ],
    "cv": "",
    "website": "",
    "email": "",
    "phone": "",
    "deployedTo": "",
    "deployment": "",
    "status": "Needs Guidance",
    "projects": [],
    "notes": "",
    "batch": "",
    "active": true
  },
  {
    "id": "va-06",
    "name": "Shiela Talana",
    "niche": [
      "Administrative Support",
      "Customer Support"
    ],
    "cv": "",
    "website": "",
    "email": "",
    "phone": "",
    "deployedTo": "",
    "deployment": "",
    "status": "Needs Guidance",
    "projects": [],
    "notes": "",
    "batch": "",
    "active": false
  },
  {
    "id": "va-07",
    "name": "Maia Castaneda",
    "niche": [
      "Administrative Support",
      "Content Creation",
      "Customer Support",
      "Executive Virtual Assistance",
      "Graphic Design",
      "Marketing Support",
      "Odoo Systems",
      "Operations Support",
      "Project Management",
      "Sales Support",
      "Social Media",
      "Video Editing",
      "Website Creation"
    ],
    "cv": "",
    "website": "",
    "email": "maiaacastaneda@gmail.com",
    "phone": "+639178921280",
    "deployedTo": "Faelight",
    "deployment": "Full TIme",
    "status": "Fully Deployed",
    "projects": [
      "Faelight Mentoring Circle",
      "5MD Designs -CarbonXS - Full EVA and Marketing Stack",
      "Uncapped SMART Collab",
      "Ultra Manpower Solutions",
      "Mean Bean Coffee",
      "Speech Coach",
      "Remoworks",
      "Zolomon AI",
      "Uncapped Digital"
    ],
    "notes": "",
    "batch": "",
    "active": true
  },
  {
    "id": "va-08",
    "name": "Michelle Antonette Diesto",
    "niche": [
      "Administrative Support",
      "Clickup Specialist",
      "Customer Support",
      "Data Entry",
      "Executive Virtual Assistance",
      "Illustration",
      "Voice Acting"
    ],
    "cv": "https://drive.google.com/file/d/1vkJLeT4wMT-k-84rlZI8G8Lhbo979yaj/view?usp=sharing",
    "website": "https://kisekikojin.com",
    "email": "michelleantonette.diesto@gmail.com",
    "phone": "+639165726079",
    "deployedTo": "Cap Hernandez",
    "deployment": "",
    "status": "Fully Deployed",
    "projects": [
      "Uncapped SMART Collab",
      "Uncapped Digital"
    ],
    "notes": "Experienced freelance illustrator, voice actor and VA",
    "batch": "",
    "active": true
  },
  {
    "id": "va-09",
    "name": "Joshua Dimalanta",
    "niche": [
      "Content Creation",
      "Customer Support",
      "Data Entry",
      "Graphic Design",
      "Marketing Support",
      "Project Management",
      "Sales Support",
      "Social Media",
      "Video Editing",
      "Voice Acting",
      "Website Creation"
    ],
    "cv": "https://drive.google.com/file/d/1wXe-28oc065vjHtkf8-3eIHRDscG3Z-a/view?usp=sharing",
    "website": "https://jdimalantamarketing.my.canva.site/",
    "email": "jdimalanta030@gmail.com",
    "phone": "(+63) 977 363 2206",
    "deployedTo": "5md\n DC Creatives",
    "deployment": "",
    "status": "Fully Deployed",
    "projects": [
      "DC Creatives"
    ],
    "notes": "",
    "batch": "",
    "active": true
  },
  {
    "id": "va-10",
    "name": "Dorwin John Diesto",
    "niche": [
      "Data Entry",
      "Operations Support"
    ],
    "cv": "https://drive.google.com/file/d/1aE1hWdydcrla1i21ngFv1xFByb1x1kyT/view?usp=sharing",
    "website": "",
    "email": "djdiesto@gmail.com",
    "phone": "+639563166490",
    "deployedTo": "HVAide",
    "deployment": "",
    "status": "Fully Deployed",
    "projects": [],
    "notes": "",
    "batch": "",
    "active": true
  },
  {
    "id": "va-11",
    "name": "Raebert Santos",
    "niche": [
      "Project Management",
      "Sales Support",
      "Voice Acting"
    ],
    "cv": "https://docs.google.com/document/d/17UyCOrzBWdn5aBr5cYMP4WB6y4vyGTWqLcrMPjsBwgM/edit?usp=share_link",
    "website": "",
    "email": "emailofraebertsantos@gmail.com",
    "phone": "+639271416448",
    "deployedTo": "",
    "deployment": "",
    "status": "Top Deployment",
    "projects": [],
    "notes": "",
    "batch": "",
    "active": true
  },
  {
    "id": "va-12",
    "name": "MICHAEL ANGELO A. YAP",
    "niche": [
      "Graphic Design",
      "Illustration",
      "Video Editing"
    ],
    "cv": "https://drive.google.com/file/d/14LXxMziNF-7ZLyaoHQ8ipW-geAO4Fi5n/view?usp=drive_link",
    "website": "https://www.coroflot.com/mikeyap/Past-Projects",
    "email": "themikeyap@gmail.com",
    "phone": "+639209584164",
    "deployedTo": "",
    "deployment": "",
    "status": "Top Deployment",
    "projects": [
      "Rinz"
    ],
    "notes": "Graphic design and illustrations: https://www.behance.net/MikeYap/projects",
    "batch": "",
    "active": true
  },
  {
    "id": "va-13",
    "name": "PATRICIA MARJORIE S. YAP",
    "niche": [
      "Administrative Support",
      "Data Entry",
      "Executive Virtual Assistance",
      "Project Management",
      "Research"
    ],
    "cv": "https://drive.google.com/file/d/1Mbb0eQYxZBPpmUMsjoQO-OjDqTaKd129/view?usp=sharing",
    "website": "https://www.linkedin.com/in/patricia-yap-9b9153b0/",
    "email": "patriciamarjorieyap@gmail.com",
    "phone": "+639209718559",
    "deployedTo": "",
    "deployment": "",
    "status": "Top Deployment",
    "projects": [
      "Rinz"
    ],
    "notes": "Waiting for Melboy",
    "batch": "",
    "active": true
  },
  {
    "id": "va-14",
    "name": "Neil Opon",
    "niche": [
      "Administrative Support",
      "Bookkeeping / Finance",
      "Data Entry"
    ],
    "cv": "https://drive.google.com/file/d/13w3F-ldQqG6dsL5NumCh4gqgEKYqf2j5/view?usp=drive_link",
    "website": "",
    "email": "oponrafael@gmail.com",
    "phone": "0995 394 6042",
    "deployedTo": "Poss: Rummel Cabangbang",
    "deployment": "",
    "status": "Partial Deployment",
    "projects": [],
    "notes": "",
    "batch": "",
    "active": true
  },
  {
    "id": "va-15",
    "name": "Juanito Whiting",
    "niche": [
      "Customer Support",
      "Graphic Design",
      "Research",
      "Social Media",
      "Voice Acting"
    ],
    "cv": "https://docs.google.com/document/d/13lvtg61TSmE5v_bKBkrUnhHW6S6WQNMcVi7gGPJINMI/edit?usp=sharing",
    "website": "https://canva.link/yusitj4z5oee0sh",
    "email": "jpdwhiting@gmail.com",
    "phone": "+63 918 559 6065",
    "deployedTo": "Mentor is Josh. Not interested",
    "deployment": "",
    "status": "Needs Guidance",
    "projects": [],
    "notes": "College student",
    "batch": "",
    "active": false
  },
  {
    "id": "va-16",
    "name": "Dan Vincent Ronquillo",
    "niche": [
      "Graphic Design",
      "Social Media",
      "Video Editing"
    ],
    "cv": "https://drive.google.com/drive/folders/18frX-zcK5TM7h68dVXG0sw0w5-BBfPsl?usp=sharing",
    "website": "https://corsacre.my.canva.site/portfolio-2026/",
    "email": "dvincentronquillo16@gmail.com",
    "phone": "+63 09204192654",
    "deployedTo": "",
    "deployment": "",
    "status": "Top Deployment",
    "projects": [],
    "notes": "Amazing Person",
    "batch": "3",
    "active": true
  },
  {
    "id": "va-17",
    "name": "Sheryll Ivy Navalta",
    "niche": [
      "Customer Support",
      "Data Entry",
      "Research",
      "Social Media"
    ],
    "cv": "https://drive.google.com/file/d/1WQvFaMSKAggdT18DO0eGx2PPXqvNLPgN/view",
    "website": "",
    "email": "navalta.sheryll@gmail.com",
    "phone": "09674575993",
    "deployedTo": "",
    "deployment": "",
    "status": "Top Deployment",
    "projects": [],
    "notes": "Cannot be for voice, Some health issue",
    "batch": "4",
    "active": true
  },
  {
    "id": "va-18",
    "name": "Alton Joshua C. Obien",
    "niche": [
      "Administrative Support",
      "Data Entry",
      "Executive Virtual Assistance",
      "Operations Support",
      "Project Management",
      "Research"
    ],
    "cv": "https://docs.google.com/document/d/1S9_Dd30EdkjeWJVg_6KrdlNASBXIwajrXlqQX142xhc/edit?usp=drivesdk",
    "website": "https://canva.link/w88kxph1xgbmwye",
    "email": "obienalton15@gmail.com",
    "phone": "09623818516",
    "deployedTo": "Mentor me and Sassa",
    "deployment": "",
    "status": "Partial Deployment",
    "projects": [
      "Faelight Mentoring Circle"
    ],
    "notes": "N/a",
    "batch": "4",
    "active": true
  },
  {
    "id": "va-19",
    "name": "Berly Dimalanta",
    "niche": [
      "Administrative Support",
      "Data Entry",
      "Executive Virtual Assistance",
      "Odoo Systems",
      "Operations Support"
    ],
    "cv": "https://drive.google.com/file/d/122kUJW-_bSoffPv7W5xACkp4JigYFXuT/view?usp=sharing",
    "website": "berlydimalanta.my.canva.site",
    "email": "eva.bdimalanta@gmail.com",
    "phone": "+639395918896",
    "deployedTo": "",
    "deployment": "",
    "status": "Fully Deployed",
    "projects": [
      "ATR Trading"
    ],
    "notes": "",
    "batch": "2",
    "active": true
  },
  {
    "id": "va-20",
    "name": "Janzell Danine Chang",
    "niche": [
      "Administrative Support",
      "Content Creation",
      "Data Entry",
      "Executive Virtual Assistance"
    ],
    "cv": "",
    "website": "",
    "email": "dandanine25@gmail.com",
    "phone": "09664582076",
    "deployedTo": "",
    "deployment": "",
    "status": "DO NOT DEPLOY",
    "projects": [],
    "notes": "Janzell is not responding to calls went AWOL on her first day",
    "batch": "2",
    "active": false
  },
  {
    "id": "va-21",
    "name": "Azriel Ronquillo",
    "niche": [
      "Administrative Support",
      "Content Creation",
      "Customer Support",
      "Data Entry",
      "Project Management",
      "Social Media",
      "Video Editing",
      "Voice Acting"
    ],
    "cv": "https://drive.google.com/file/d/1HntvfXSdVfxbdtR-ZO5NFd8ShgwNKYGb/view?usp=sharing",
    "website": "https://manuelportfolioartapp.my.canva.site/azriel-ronquillo",
    "email": "aemronquillo17@gmail.com",
    "phone": "+63 998 356 8530",
    "deployedTo": "",
    "deployment": "",
    "status": "Top Deployment",
    "projects": [
      "Uncapped Digital",
      "Faelight Mentoring Circle"
    ],
    "notes": "Student and needs Part Time",
    "batch": "4",
    "active": true
  },
  {
    "id": "va-22",
    "name": "Miguel M. Halago",
    "niche": [
      "Customer Support",
      "Executive Virtual Assistance",
      "Sales Support"
    ],
    "cv": "",
    "website": "",
    "email": "miguelhalagoworker@gmail.com",
    "phone": "09333939043",
    "deployedTo": "",
    "deployment": "",
    "status": "Needs Guidance",
    "projects": [],
    "notes": "",
    "batch": "",
    "active": true
  },
  {
    "id": "va-23",
    "name": "Larissa Maquera",
    "niche": [
      "Customer Support",
      "Data Entry",
      "Executive Virtual Assistance",
      "Graphic Design",
      "Illustration",
      "Project Management",
      "Social Media",
      "Video Editing"
    ],
    "cv": "https://docs.google.com/document/d/1H6UhOClKPjEK8BTitO2z9kKom_twp9ks/edit?usp=drivesdk&ouid=116539824731238345114&rtpof=true&sd=true",
    "website": "https://canva.link/r7upc80iih0ujp3",
    "email": "glarissa.maquera@gmail.com",
    "phone": "09292002954",
    "deployedTo": "",
    "deployment": "",
    "status": "Partial Deployment",
    "projects": [],
    "notes": "",
    "batch": "3",
    "active": true
  },
  {
    "id": "va-24",
    "name": "Julius Umali",
    "niche": [
      "Operations Support",
      "Project Management"
    ],
    "cv": "https://drive.google.com/file/d/17NMjuQjtaGQUsirnVaG-s55lpmMKGuwl/view?usp=sharing",
    "website": "https://umalijuliusm.github.io/julius-EOS-website/",
    "email": "umalijuliusm@gmail.com",
    "phone": "",
    "deployedTo": "",
    "deployment": "",
    "status": "Top Deployment",
    "projects": [],
    "notes": "",
    "batch": "4",
    "active": true
  },
  {
    "id": "va-25",
    "name": "Joanna Uson",
    "niche": [
      "Animation",
      "Graphic Arts",
      "Graphic Design",
      "Illustration"
    ],
    "cv": "https://drive.google.com/file/d/16b1tZO8CL-Yt3AnZH4tYzFBtcCsilHiy/view",
    "website": "https://drive.google.com/drive/folders/1RtxpykvU2lo4f8L_z-MGCxd0yIIrPCHR?usp=drive_link",
    "email": "joannauson12@gmail.com",
    "phone": "",
    "deployedTo": "",
    "deployment": "",
    "status": "Referrak",
    "projects": [],
    "notes": "Not an attendee, from Ms. QUeenie Aranas",
    "batch": "",
    "active": false
  },
  {
    "id": "va-26",
    "name": "Ansherina Bron",
    "niche": [],
    "cv": "",
    "website": "",
    "email": "",
    "phone": "",
    "deployedTo": "",
    "deployment": "",
    "status": "",
    "projects": [],
    "notes": "",
    "batch": "",
    "active": false
  }
];
