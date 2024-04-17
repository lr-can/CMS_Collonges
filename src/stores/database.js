import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useSqlStore = defineStore('database', () => {
  const NextPeremptions = ref({});
  const PeremptionsDisplayData = ref({});
  const materielsList = ref({});
  const responseCreation = ref("");
  const todayCreationList = ref([]);
  const deleteResponse = ref("");

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

  async function cancelTodayCreation(idMateriel){
    const requestOptions = {
      method: "DELETE",
      redirect: "follow"
    };
    
    try {
      const response = await fetch(`https://cms-collonges-api.adaptable.app/remove/${idMateriel}`, requestOptions);
      const result = await response.json();
      const data = result.data;
      deleteResponse.value = data;
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
    cancelTodayCreation
  };
});