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

  async function getNextPeremptions() {
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };
    
    try {
      const response = await fetch("https://cms-collonges-api.adaptable.app/Peremptions", requestOptions);
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
      const response = await fetch("https://cms-collonges-api.adaptable.app/peremptionscount", requestOptions);
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
      const response = await fetch("https://cms-collonges-api.adaptable.app/materielstheoriques", requestOptions);
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
      const response = await fetch("https://cms-collonges-api.adaptable.app/createDB", requestOptions);
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
      const response = await fetch(`https://cms-collonges-api.adaptable.app/todayCreation/${idMateriel}`, requestOptions);
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
      const response = await fetch(`https://cms-collonges-api.adaptable.app/remove/${idStock}`, requestOptions);
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
      const response = await fetch(`https://cms-collonges-api.adaptable.app/dataVision/${idMateriel}`, requestOptions);
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
      const response = await fetch(`https://cms-collonges-api.adaptable.app/archivePeremption`, requestOptions);
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
      const response = await fetch(`https://cms-collonges-api.adaptable.app/getOneMonthPeremption`, requestOptions);
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
      const response = await fetch("https://cms-collonges-api.adaptable.app/getRealCount", requestOptions);
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
      const response = await fetch(`https://cms-collonges-api.adaptable.app/getMaterielsToCheck/${typeRequest}`, requestOptions);
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
      const response = await fetch(`https://cms-collonges-api.adaptable.app/getPharmaItems/${idMateriel}`, requestOptions);
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
      const response = await fetch("https://cms-collonges-api.adaptable.app/archivePharma", requestOptions);
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
      const response = await fetch(`https://cms-collonges-api.adaptable.app/getReserveItems/${idMateriel}`, requestOptions);
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
      const response = await fetch("https://cms-collonges-api.adaptable.app/dispoReserve", requestOptions);
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
      const response = await fetch(`https://cms-collonges-api.adaptable.app/reinitialiserRetourInter`, requestOptions);
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
        const response = await fetch(`https://cms-collonges-api.adaptable.app/getAsupAgents/${idAgent}`, requestOptions);
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
      const response = await fetch(`https://cms-collonges-api.adaptable.app/getDoctor/${rppsNumber}`, requestOptions);
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
    const response = await fetch(`https://cms-collonges-api.adaptable.app/getMedicamentsForCare/${acte}/${vsav}`, requestOptions);
    const result = await response.json();
    const data = result.data;

    // Transformation des données
    const groupedData = data.reduce((acc, item) => {
      const { nomMedicament, idMedicament, numLot, datePeremption, idStockAsup } = item;
      const formattedDate = new Date(datePeremption).toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' });

      const group = acc.find(g => g.label === nomMedicament && g.code === idMedicament);
      const newItem = {
        label: {lot: `${numLot}`, peremption: `${formattedDate}`},
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
    asupAvailableMedicaments
  };
});