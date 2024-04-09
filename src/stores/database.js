import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useSqlStore = defineStore('database', () => {
  const NextPeremptions = ref({});

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
  return {
    NextPeremptions,
    getNextPeremptions
  };
});