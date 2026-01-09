import { ref, computed } from 'vue'
import { useSqlStore } from '@/stores/database.js'

const STORAGE_KEY = 'cms_matricule'
const STORAGE_KEY_AGENT_INFO = 'cms_agent_info'

export function useMatricule() {
  const sqlStore = useSqlStore()
  
  // Récupérer le matricule depuis localStorage
  const getStoredMatricule = () => {
    return localStorage.getItem(STORAGE_KEY) || null
  }
  
  // Récupérer les infos agent depuis localStorage
  const getStoredAgentInfo = () => {
    const stored = localStorage.getItem(STORAGE_KEY_AGENT_INFO)
    return stored ? JSON.parse(stored) : null
  }
  
  // Sauvegarder le matricule
  const saveMatricule = (matricule) => {
    if (matricule) {
      localStorage.setItem(STORAGE_KEY, matricule)
    }
  }
  
  // Sauvegarder les infos agent
  const saveAgentInfo = (agentInfo) => {
    if (agentInfo) {
      localStorage.setItem(STORAGE_KEY_AGENT_INFO, JSON.stringify(agentInfo))
    }
  }
  
  // Récupérer et sauvegarder les infos agent depuis le matricule
  const fetchAndSaveAgentInfo = async (matricule) => {
    if (!matricule) return null
    
    try {
      await sqlStore.getAsupAgentInfo(matricule)
      const result = sqlStore.infoAsupAgent
      
      if (result && !result.message) {
        saveMatricule(matricule)
        saveAgentInfo(result)
        return result
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération des infos agent:', error)
      return null
    }
  }
  
  // Effacer le matricule et les infos
  const clearMatricule = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_KEY_AGENT_INFO)
  }
  
  // Vérifier si un matricule est stocké
  const hasStoredMatricule = computed(() => {
    return !!getStoredMatricule()
  })
  
  // Obtenir le prénom de l'agent stocké
  const getStoredPrenom = computed(() => {
    const agentInfo = getStoredAgentInfo()
    return agentInfo?.prenomAgent || null
  })
  
  return {
    getStoredMatricule,
    getStoredAgentInfo,
    saveMatricule,
    saveAgentInfo,
    fetchAndSaveAgentInfo,
    clearMatricule,
    hasStoredMatricule,
    getStoredPrenom
  }
}

