import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useSqlStore = defineStore('database', () => {
  const NextPeremptions = ref({});
  const PeremptionsDisplayData = ref({});
  const materielsList = ref({});
  const responseCreation = ref("");
  const todayCreationList = ref([]);
  const deleteResponse = ref("");
  const dbVisionData = ref({});
  const archivagePeremptionResponse = ref({});
  const oneMonthPeremption = ref("");
  const realCountList = ref([]);
  const adressesMails = ref([]);
  const materielsToCheck = ref([]);
  const visualisationPharma = ref([]);
  const responseArchivePharma = ref("");
  const visualisationReserve = ref([]);
  const infoAsupAgent = ref({});
  const doctorInfo = ref({});
  const lastNotifs = ref([]);
  const asupAvailableMedicaments = ref([]);
  const responseAsupDeclaration = ref(null);
  const lastDemandePeremptionAsup = ref({});
  const asupPeremptionData = ref({});
  const PeremptionsDisplayDataAsup = ref({});
  const NextPeremptionsAsup = ref([]);
  const medicamentsList = ref([]);
  const medicamentsToReplace = ref([]);
  const materielAAssocier = ref({});
  const asupVizData = ref({});
  const PeremptionsDisplayDataFormation = ref({});
  const listSinistres = ref([]);
  const searchedAddress = ref([]);
  const moreAddress = ref({});

  async function getNextPeremptions() {
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };
    
    try {
      const response = await fetch("https://api.cms-collonges.fr/Peremptions", requestOptions);
      const result = await response.json();
      const data = result.data;
      NextPeremptions.value = data;
    } catch (error) {
      console.error(error);
    }
  }


  async function getPeremptionDisplay() {
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };
    
    try {
      const response = await fetch("https://api.cms-collonges.fr/peremptionscount", requestOptions);
      const result = await response.json();
      const data = result.data;
      PeremptionsDisplayData.value = data[0];
    } catch (error) {
      console.error(error);
    }
  }

  async function getMateriels() {
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };
    
    try {
      const response = await fetch("https://api.cms-collonges.fr/materielstheoriques", requestOptions);
      const result = await response.json();
      const data = result.data;
      materielsList.value = data;
    } catch (error) {
      console.error(error);
    }
  }

  async function createMateriel(data) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const raw = JSON.stringify(data);
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };
    
    try {
      console.log(requestOptions.body)
      const response = await fetch("https://api.cms-collonges.fr/createDB", requestOptions);
      const result = await response.json();
      responseCreation.value = result;
      console.log(result);
    } catch (error) {
      console.error(error);
      console.log(responseCreation.value);
      responseCreation.value = error;
    }
  }
  
  async function getTodayCreation(idMateriel) {
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };
    
    try {
      const response = await fetch(`https://api.cms-collonges.fr/todayCreation/${idMateriel}`, requestOptions);
      const result = await response.json();
      const data = result.data;
      todayCreationList.value = data;
    } catch (error) {
      console.error(error);
    }
  }

  async function cancelTodayCreation(idStock){
    const requestOptions = {
      method: "DELETE",
      redirect: "follow"
    };
    
    try {
      const response = await fetch(`https://api.cms-collonges.fr/remove/${idStock}`, requestOptions);
      const result = await response.json();
      const data = result.data;
      deleteResponse.value = data;
    } catch (error) {
      console.error(error);
    }
  }

  async function dbVision(idMateriel){
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };
    
    try {
      const response = await fetch(`https://api.cms-collonges.fr/dataVision/${idMateriel}`, requestOptions);
      const result = await response.json();
      const data = result.data;
      dbVisionData.value = data;
    } catch (error) {
      console.error(error);
    }
  }

  async function archivePeremption(){
    const requestOptions = {
      method: "PUT",
      redirect: "follow"
    };
    
    try {
      const response = await fetch(`https://api.cms-collonges.fr/archivePeremption`, requestOptions);
      const result = await response.json();
      const data = result.data;
      console.log(data);
      archivagePeremptionResponse.value = data;
    } catch (error) {
      console.error(error);
      archivagePeremptionResponse.value = error;
    }
  }

  async function getOneMonthPeremption(){
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };
    
    try {
      const response = await fetch(`https://api.cms-collonges.fr/getOneMonthPeremption`, requestOptions);
      const result = await response.json();
      const data = result.data;
      oneMonthPeremption.value = data[0].perimant;
    } catch (error) {
      console.error(error);
    }
  }

  async function getRealCount() {
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };
    
    try {
      const response = await fetch("https://api.cms-collonges.fr/getRealCount", requestOptions);
      const result = await response.json();
      const data = result.data;
      realCountList.value = data;
    } catch (error) {
      console.error(error);
    }
  }

  async function getMaterielsToCheck(typeRequest) {
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };
    try {
      const response = await fetch(`https://api.cms-collonges.fr/getMaterielsToCheck/${typeRequest}`, requestOptions);
      const result = await response.json();
      const data = result.data;
      materielsToCheck.value = data;
    } catch (error) {
      console.error(error);
    }
  }

  async function getVisualisationPharma(idMateriel) {
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };
    
    try {
      const response = await fetch(`https://api.cms-collonges.fr/getPharmaItems/${idMateriel}`, requestOptions);
      const result = await response.json();
      const data = result.data;
      visualisationPharma.value = data;
    } catch (error) {
      console.error(error);
    }
  }

  async function archivePharma(data) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const raw = JSON.stringify(data);
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    try {
      console.log(requestOptions.body)
      const response = await fetch("https://api.cms-collonges.fr/archivePharma", requestOptions);
      const result = await response.json();
      responseArchivePharma.value = result.message;
      console.log(result);
    } catch (error) {
      console.error(error);
      console.log(responseCreation.value);
      responseCreation.value = error;
    }
  }

  async function getVisualisationReserve(idMateriel) {
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };
    
    try {
      const response = await fetch(`https://api.cms-collonges.fr/getReserveItems/${idMateriel}`, requestOptions);
      const result = await response.json();
      const data = result.data;
      visualisationReserve.value = data;
    } catch (error) {
      console.error(error);
    }
  }

  async function dispoReserve(data) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const raw = JSON.stringify(data);
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    try {
      console.log(requestOptions.body)
      const response = await fetch("https://api.cms-collonges.fr/dispoReserve", requestOptions);
      const result = await response.json();
      responseArchivePharma.value = result.message;
      console.log(result);
    } catch (error) {
      console.error(error);
      console.log(responseCreation.value);
      responseCreation.value = error;
    }
  }

  async function reinitialiserRetourIntervention(){
    const requestOptions = {
      method: "PUT",
      redirect: "follow"
    };
    
    try {
      const response = await fetch(`https://api.cms-collonges.fr/reinitialiserRetourInter`, requestOptions);
      const result = await response.json();
      const data = result.data;
      console.log(data);
      archivagePeremptionResponse.value = data;
    } catch (error) {
      console.error(error);
      archivagePeremptionResponse.value = error;
    }
  }

  async function getAsupAgentInfo(idAgent){
      const requestOptions = {
        method: "GET",
        redirect: "follow"
      };

      try {
        const response = await fetch(`https://api.cms-collonges.fr/getAsupAgents/${idAgent}`, requestOptions);
        const result = await response.json();
        infoAsupAgent.value = result;
        console.log(result);
      } catch (error) {
        infoAsupAgent.value = error.message;
        console.error(error);
    }
  }

  async function getDoctorInfo(rppsNumber){
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };

    try {
      const response = await fetch(`https://api.cms-collonges.fr/getDoctor/${rppsNumber}`, requestOptions);
      const result = await response.json();
      doctorInfo.value = result;
      console.log(result);
    } catch (error) {
      doctorInfo.value = error.message;
      console.error(error);
  }
}

async function getLastNotifs(){
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };

  try {
    const response = await fetch(`https://opensheet.elk.sh/1-S_8VCPQ76y3XTiK1msvjoglv_uJVGmRNvUZMYvmCnE/Feuille%201`, requestOptions);
    const result = await response.json();
    const reversedData = result.reverse();
    const filteredNotifs = reversedData.filter(item => item.numeroInter);
    const uniqueNotifs = filteredNotifs.filter((item, index, self) =>
      index === self.findIndex((t) => t.numeroInter === item.numeroInter)
    );
    lastNotifs.value = uniqueNotifs;
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

async function getAsupAvailableMedicaments(acte, vsav) {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };

  try {
    const response = await fetch(`https://api.cms-collonges.fr/getMedicamentsForCare/${acte}/${vsav}`, requestOptions);
    const result = await response.json();
    const data = result.data;

    // Transformation des données
    const groupedData = data.reduce((acc, item) => {
      const { nomMedicament, idMedicament, numLot, datePeremption, idStockAsup } = item;
      const formattedDate = new Date(datePeremption).toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' });

      const group = acc.find(g => g.label === nomMedicament && g.code === idMedicament);
      const newItem = {
        label: {lot: `${numLot}`, peremption: `${formattedDate}`, name: `${nomMedicament}`},
        code: idStockAsup
      };

      if (group) {
        group.items.push(newItem);
      } else {
        acc.push({
          label: nomMedicament,
          code: idMedicament,
          items: [newItem]
        });
      }

      return acc;
    }, []);

    asupAvailableMedicaments.value = groupedData;
    console.log(groupedData);
  } catch (error) {
    asupAvailableMedicaments.value = error.message;
    console.error(error);
  }
}

async function sendAsupDeclaration(data) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify(data);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  try {
    const response = await fetch("https://api.cms-collonges.fr/newUtilisationAsup", requestOptions);
    const result = await response.json();
    responseAsupDeclaration.value = result.meta;
    console.log(result);
  } catch (error) {
    responseAsupDeclaration.value = error;
    console.error(error);
  }
}

async function sendAsupEmail(emailData) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify(emailData);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };
  try {
    const response = await fetch("https://api.cms-collonges.fr/sendEmailAsup", requestOptions);
    const result = await response.json();
    if (response.ok) {
      console.log(result);
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error(error);
  }
}

async function getDemandePeremptionAsup() {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  try {
    const response = await fetch(`https://api.cms-collonges.fr/getLastDemandePeremptionAsup`, requestOptions);
    const result = await response.json();
    lastDemandePeremptionAsup.value = result;
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

async function addDemandePeremptionAsup(data) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify(data);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };
  try {
    const response = await fetch("https://api.cms-collonges.fr/addDemandePeremptionAsup", requestOptions);
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

async function getPeremptionCountAsup(){
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  try {
    const response = await fetch(`https://api.cms-collonges.fr/getAsupReplacementCount`, requestOptions);
    const result = await response.json();
    asupPeremptionData.value = result;
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

async function getPeremptionDisplayAsup() {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  
  try {
    const response = await fetch("https://api.cms-collonges.fr/getAsupPeremptionCount", requestOptions);
    const result = await response.json();
    const data = result.data;
    PeremptionsDisplayDataAsup.value = data[0];
  } catch (error) {
    console.error(error);
  }
}

async function getNextPeremptionsAsup() {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  
  try {
    const response = await fetch("https://api.cms-collonges.fr/getPeremptionsAsup", requestOptions);
    const result = await response.json();
    const data = result.data;
    NextPeremptionsAsup.value = data;
  } catch (error) {
    console.error(error);
  }
}


async function getLastCommitNumber(repo) {
    const url = `https://api.github.com/repos/lr-can/${repo}/commits?sha=main&per_page=1&page=1`;
    try {
        const response = await fetch(url);
        const linkHeader = response.headers.get('link');

        if (linkHeader) {
            const lastPageLink = linkHeader.split(',').find(s => s.includes('rel="last"'));
            if (lastPageLink) {
                const lastPageUrl = lastPageLink.split(';')[0].trim().slice(1, -1);
                const urlParams = new URLSearchParams(lastPageUrl.split('?')[1]);
                const lastPageNumber = urlParams.get('page');
                console.log('Last page number:', lastPageNumber);
                return lastPageNumber;
            }
        }
        return null;
    } catch (error) {
        console.error('Erreur:', error);
        return null;
    }
}

async function getMedicamentsList() {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  const acteSoinLabels = {
    "allergie": "1A - Choc anaphylactique",
    "asthme": "1B - Crise d'asthme",
    "naloxone": "1C - Intoxication aux opiacés",
    "methoxyflurane": "2A - Douleur par inhalation",
    "paracetamol": "2B - Douleur per os",
    "glucagon": "2C - Hypoglycémie"
  };
  try {
    const response = await fetch(`https://api.cms-collonges.fr/getMedicaments`, requestOptions);
    const result = await response.json();
    const groupedMedicaments = result.data.reduce((acc, medicament) => {
      const { acteSoin, nomMedicament, idMedicament } = medicament;
      const label = acteSoinLabels[acteSoin] || acteSoin;
      if (!acc[acteSoin]) {
        acc[acteSoin] = {
          label: label,
          code: acteSoin,
          items: []
        };
      }
      acc[acteSoin].items.push({ label: nomMedicament, value: idMedicament });
      return acc;
    }, {});
    const medicamentsListArray = Object.values(groupedMedicaments);
    medicamentsListArray.sort((a, b) => a.label.localeCompare(b.label));
    medicamentsList.value = medicamentsListArray;
    console.log(medicamentsListArray);
  } catch (error) {
    console.error(error);
    return null;
  }
}

const getMedicamentsToReplace = async (idMedicament) => {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  try {
    const response = await fetch(`https://api.cms-collonges.fr/getMedicamentsToReplace/${idMedicament}`, requestOptions);
    const result = await response.json();
    medicamentsToReplace.value = result.data;
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
}

const replaceAsup = async (materielsAremplacer, vsavNombreDict, newMedicamentInfo, matricule) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw1 = JSON.stringify({ materielsAremplacer, matricule });
  console.log(raw1);
  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: raw1,
    redirect: "follow"
  };

  try {
    const response = await fetch("https://api.cms-collonges.fr/replaceStep1", requestOptions1);
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(error);
  }

  const myHeaders2 = new Headers();
  myHeaders2.append("Content-Type", "application/json");
  const raw2 = JSON.stringify({ vsavNombreDict, newMedicamentInfo, matricule });
  console.log(raw2);
  const requestOptions2 = {
    method: "POST",
    headers: myHeaders2,
    body: raw2,
    redirect: "follow"
  };
  try {
    const response = await fetch("https://api.cms-collonges.fr/replaceStep2", requestOptions2);
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(error);
  }

}

async function getWhithAffection(idMedicament) {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  try {
    const response = await fetch(`https://api.cms-collonges.fr/getReplaceStep3/${idMedicament}`, requestOptions);
    const result = await response.json();
    materielAAssocier.value = result.data;
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

async function affectToVsav(data) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify(data);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };
  console.log(raw);
  try {
    const response = await fetch("https://api.cms-collonges.fr/replaceStep3", requestOptions);
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

async function getAsupVizData() {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  try {
    const response = await fetch(`https://api.cms-collonges.fr/getVizDataAsup`, requestOptions);
    const result = await response.json();
    asupVizData.value = result.data;
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

async function getPeremptionDisplayFormation() {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  const currentYear = new Date().getFullYear();
  try {
    const response = await fetch(`https://opensheet.elk.sh/1aiagcxGaeehUTY8WEfY_ekOn3dol7HmveFylOWoX2OE/Avancement%20FMPA%20${currentYear}`, requestOptions);
    const result = await response.json();
    const nbAgents = result.length;
    let nbRecycle = parseInt(nbAgents);
    let nbNonRecycle = 0;
    let nbSansICP = 0;
    for (const agent of result) {
      if (agent['FMPA \nOpérations divers'] === "Pas recyclé" || agent['FMPA \nIncendie'] === "Pas recyclé" || agent['FMPA \nCOD 1'] === "Pas recyclé" || agent["FMPA \nCOD 4"] === "Pas recyclé") {
        nbNonRecycle++;
        nbRecycle--;
      } 
      if (agent["ICP\n"].includes('Pas')) {
        nbSansICP++;
      }
    }

    PeremptionsDisplayDataFormation.value = {nbTotal: nbAgents, nbLotsTotal: nbRecycle, nbReserve: nbSansICP, nbVSAV: nbNonRecycle};
  } catch (error) {
    console.error(error);
  }
}

async function getListSinistres() {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  try {
    const response = await fetch(`https://opensheet.elk.sh/13y-17sHUSenIoehILJMzuJcpqnRG2CVX9RvDzvaa448/libelleSinistres`, requestOptions);
    const data = await response.json();
    const formattedResult = data
      .filter(item => item.sinistreStatut === "1")
      .reduce((acc, item) => {
        const { sinistreCat, sinistreLib, sinistreLibInter, sinistreGFOBase, sinistreCode } = item;
        const category = acc.find(cat => cat.label === sinistreCat);
        const newItem = {
          label: sinistreLib,
          labelComplet: sinistreLibInter,
          listGfo: sinistreGFOBase.split(", "),
          code: sinistreCode
        };

        if (category) {
          category.items.push(newItem);
        } else {
          acc.push({
            label: sinistreCat,
            items: [newItem]
          });
        }

        return acc;
      }, []);

    listSinistres.value = formattedResult;
    console.log(listSinistres.value);
  } catch (error) {
    console.error(error);
  }
}

async function searchAddress(query){
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  try {
    const response = await fetch(`https://api.cms-collonges.fr/getFormationAutoSuggest/${encodeURIComponent(query)}`, requestOptions);
    const result = await response.json();
    const features = result.features;
    const formattedResult = features.reduce((acc, feature) => {
      const { postcode, city, name, distance, ...rest } = feature.properties;
      const [lon, lat] = feature.geometry.coordinates;
      const label = `${postcode} - ${city}`;
      const newItem = { label: name, distance, city, lon, lat, ...rest };

      const group = acc.find(g => g.label === label);
      if (group) {
      group.items.push(newItem);
      } else {
      acc.push({
        label: label,
        items: [newItem]
      });
      }

      return acc;
    }, []);

    // Sort each group by minimum distance
    formattedResult.forEach(group => {
      group.items.sort((a, b) => a.distance - b.distance);
    });

    searchedAddress.value = formattedResult;
    console.log(searchedAddress.value);
  } catch (error) {
    console.error(error);
  }

}

async function getMoreAddress(lon, lat){
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  try {
    const response = await fetch(`https://api.cms-collonges.fr/getFormationCoordinates/${lon}/${lat}`, requestOptions);
    const result = await response.json();
    moreAddress.value = result;    
  } catch (error) {
    console.error(error);
  }
}

const agentsList = ref([]);

function gradeAbbreviation(grade){
  const grades = {
    "Sap 2CL": "SAP",
    "Sap 1CL": "SAP",
    "Caporal" : "CAP",
    "Caporal-Chef": "CCH",
    "Sergent": "SGT",
    "Sergent-Chef": "SCHE",
    "Adjudant": "ADJ",
    "Adjudant-Chef": "ADC",
    "Lieutenant": "LTN",
    "Capitaine": "CNE",
    "Commandant": "CDT",
    "Colonel": "COL",
    "Lieutenant-Colonel": "LCL",
    "Infirmière": "INF",
  }
  return grades[grade];
  }

async function getAgentsList() {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  try {
    const response = await fetch(`https://opensheet.elk.sh/1ottTPiBjgBXSZSj8eU8jYcatvQaXLF64Ppm3qOfYbbI/agentsASUP`, requestOptions);
    let result = await response.json();
    result = result.map(item => ({
      ...item,
      label: `${item.matricule} - ${gradeAbbreviation(item.grade)} ${item.nomAgent} ${item.prenomAgent}`,
      label_short: `${gradeAbbreviation(item.grade)} ${item.nomAgent} ${item.prenomAgent}`,
    }));
    agentsList.value = result;
  }
  catch (error) {
    console.error(error);
  }
}

const availableEngins = ref([]);
async function getAvailableEngins(gfo) {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  try {
    const response = await fetch(`https://opensheet.elk.sh/13y-17sHUSenIoehILJMzuJcpqnRG2CVX9RvDzvaa448/GFO_COLLONGES`, requestOptions);
    const result = await response.json();
    console.log("result", result);
    let availableEnginsDump = [];
    for (const item of result) {
      console.log(item[`priorite_GFO_${gfo}`])
      if (item[`priorite_GFO_${gfo}`] != "0") {
        availableEnginsDump.push(item.libEngin);
      }
    }
    availableEngins.value = availableEnginsDump;
  } catch (error) {
    console.error(error);
  }
}

const availableRoles = ref([]);
async function getAvailableRoles(gfo) {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  try {
    const response = await fetch(`https://opensheet.elk.sh/13y-17sHUSenIoehILJMzuJcpqnRG2CVX9RvDzvaa448/GFO_EMPLOIS`, requestOptions);
    const result = await response.json();
    for (const item of result) {
      if (item.GFO === gfo) {
        availableRoles.value = item.emploisGFO_pref.split(', ');
        break;
      }
    }
  } catch (error) {
    console.error(error);
  }
}

const automaticAffectationRes = ref();
async function automaticAffectation(payload) {
  console.log("payload", payload);
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify(payload);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };
  try {
    const response = await fetch("https://api.cms-collonges.fr/vehiculesAffectation", requestOptions);
    const result = await response.json();
    automaticAffectationRes.value = result;
    console.log("res", result);
  } catch (error) {
    console.error(error);
  }
}

const vehiculesList = ref([]);
const casernesList = ref([]);

async function getVehiculesAndCasernesList() {
  try {
    const response = await fetch('https://api.cms-collonges.fr/getVehiculesAndCaserne', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    );
    const data = await response.json();
    vehiculesList.value = data.vehicleTypes.map(item => ({
      label: item.code + " - " + item.name,
      ...item
    }));
    casernesList.value = data.fireunits.filter(fireunit => /^\d/.test(fireunit.code));
    console.log('Vehicules:', vehiculesList.value);
    console.log('Casernes:', casernesList.value);
  } catch (error) {
    console.error('Error fetching vehicules and casernes data:', error);
  }
}

const telex = ref('');

async function generateTelex(payload) {
  console.log("payload", payload);
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify(payload);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };
  try {
    const response = await fetch("https://api.cms-collonges.fr/generateTelex", requestOptions);
    const result = await response.text();
    telex.value = result;
  } catch (error) {
    console.error(error);
  }
}

async function getPeremptionAndCount(){
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  try {
    const response = await fetch(`https://api.cms-collonges.fr/getPeremptionAndCount`, requestOptions);
    const result = await response.json();
    const data = result;
    return data;
  } catch (error) {
    console.error(error);
  }
}

async function getVehiculesRI(isPromptSecours){
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  try {
    const response = await fetch(`https://opensheet.elk.sh/1-S_8VCPQ76y3XTiK1msvjoglv_uJVGmRNvUZMYvmCnE/Feuille%204`, requestOptions);
    const result = await response.json();
    const data = result;
    let data_filtered = null;
    if (isPromptSecours){
      data_filtered = data.filter(item => item.engLib.includes("VSAV") || item.engLib.includes("VTU"));
    } else {
      data_filtered = data.filter(item => item.engLib.includes("VSAV"));
    }
    return data_filtered.map(item => item.engLib);
  } catch (error) {
    console.error(error);
  }
}


  return {
    NextPeremptions,
    getNextPeremptions,
    PeremptionsDisplayData,
    getPeremptionDisplay,
    materielsList,
    getMateriels,
    responseCreation,
    createMateriel,
    todayCreationList,
    getTodayCreation,
    deleteResponse,
    cancelTodayCreation,
    dbVisionData,
    dbVision,
    archivagePeremptionResponse,
    archivePeremption,
    oneMonthPeremption,
    getOneMonthPeremption,
    realCountList,
    getRealCount,
    adressesMails,
    materielsToCheck,
    getMaterielsToCheck,
    visualisationPharma,
    getVisualisationPharma,
    responseArchivePharma,
    archivePharma,
    visualisationReserve,
    getVisualisationReserve,
    dispoReserve,
    reinitialiserRetourIntervention,
    getAsupAgentInfo,
    infoAsupAgent,
    getDoctorInfo,
    doctorInfo,
    getLastNotifs,
    lastNotifs,
    getAsupAvailableMedicaments,
    asupAvailableMedicaments,
    sendAsupDeclaration,
    responseAsupDeclaration,
    sendAsupEmail,
    getDemandePeremptionAsup,
    lastDemandePeremptionAsup,
    addDemandePeremptionAsup,
    getPeremptionCountAsup,
    asupPeremptionData,
    getPeremptionDisplayAsup,
    PeremptionsDisplayDataAsup,
    getNextPeremptionsAsup,
    NextPeremptionsAsup,
    getLastCommitNumber,
    getMedicamentsList,
    medicamentsList,
    getMedicamentsToReplace,
    medicamentsToReplace,
    replaceAsup,
    getWhithAffection,
    materielAAssocier,
    affectToVsav,
    getAsupVizData,
    asupVizData,
    getPeremptionDisplayFormation,
    PeremptionsDisplayDataFormation,
    getListSinistres,
    listSinistres,
    searchAddress,
    searchedAddress,
    getMoreAddress,
    moreAddress,
    getAgentsList,
    agentsList,
    getAvailableRoles,
    availableRoles,
    getAvailableEngins,
    availableEngins,
    automaticAffectation,
    automaticAffectationRes,
    gradeAbbreviation,
    vehiculesList,
    casernesList,
    getVehiculesAndCasernesList,
    generateTelex,
    telex,
    getPeremptionAndCount,
    getVehiculesRI,
  };
});