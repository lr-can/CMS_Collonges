import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useSqlStore = defineStore('database', () => {
  const NextPeremptions = ref({});
  const PeremptionsDisplayData = ref({});

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



  return {
    NextPeremptions,
    getNextPeremptions,
    PeremptionsDisplayData,
    getPeremptionDisplay
  };
});