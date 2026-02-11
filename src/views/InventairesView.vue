<template>
  <div class="inventaire-container">
    <header class="inventaire-header">
      <h1>Inventaire de Véhicule</h1>
      <p class="inventaire-subtitle">
        {{ subtitleText }}
      </p>
    </header>

    <div v-if="firebaseLoading" class="loading-message">
      Vérification de l'inventaire en cours...
    </div>
    <div v-else>
      <div v-if="firebaseError" class="error-message">
        {{ firebaseError }}
      </div>
      <div v-else-if="submitSuccessMessage" class="success-message">
        {{ submitSuccessMessage }}
      </div>
      <template v-if="!hasInventaire">
    <section class="inventaire-section">
      <div class="section-header">
        <h2>Réalisateurs de l'inventaire</h2>
        <div class="selection-count">
          {{ selectedAgents.length }} / 4 sélectionnés
        </div>
      </div>

      <div class="status-legend">
        <div
          v-for="status in statusLegend"
          :key="status.key"
          class="status-legend-item"
        >
          <span class="status-dot" :style="{ backgroundColor: status.color }"></span>
          <span>{{ status.label }}</span>
        </div>
      </div>

      <div class="selection-summary">
        <div class="summary-item">
          <span class="summary-label">Chef de garde :</span>
          <span class="summary-value">
            {{ chefDeGarde ? formatAgentName(chefDeGarde) : '—' }}
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Inventaireur 1 :</span>
          <span class="summary-value">
            {{ inventaireur1 ? formatAgentName(inventaireur1) : '—' }}
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Inventaireur 2 :</span>
          <span class="summary-value">
            {{ inventaireur2 ? formatAgentName(inventaireur2) : '—' }}
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Inventaireur 3 :</span>
          <span class="summary-value">
            {{ inventaireur3 ? formatAgentName(inventaireur3) : '—' }}
          </span>
        </div>
      </div>

      <div v-if="agentsLoading" class="loading-message">
        Chargement des agents...
      </div>
      <div v-else-if="agentsError" class="error-message">
        {{ agentsError }}
      </div>
      <div v-else class="agents-wrapper">
        <div
          v-for="group in groupedAgents"
          :key="group.key"
          class="agent-group"
          :class="{ empty: group.items.length === 0 }"
        >
          <button
            type="button"
            class="agent-group-title"
            :aria-expanded="expandedStatus[group.key]"
            :disabled="group.items.length === 0"
            @click="toggleGroup(group)"
          >
            <span
              class="status-dot"
              :style="{ backgroundColor: group.items.length === 0 ? '#d1d5db' : group.color }"
            ></span>
            <span class="group-label">{{ group.label }}</span>
            <span class="toggle-indicator" :class="{ muted: group.items.length === 0 }">
              {{ group.items.length === 0 ? 'Aucun agent disponible' : (expandedStatus[group.key] ? 'Réduire' : 'Afficher') }}
            </span>
          </button>
          <div v-if="group.items.length > 0 && expandedStatus[group.key]" class="agent-grid">
            <button
              v-for="agent in group.items"
              :key="agent.matricule"
              type="button"
              class="agent-card"
              :class="{ selected: isSelected(agent) }"
              @click="toggleAgent(agent)"
            >
              <div class="agent-card-header">
                <img
                  v-if="gradeImage(agent.grade)"
                  :src="gradeImage(agent.grade)"
                  :alt="agent.grade"
                  class="agent-grade-icon"
                />
                <div class="agent-name">
                  {{ agent.nom }} {{ agent.prenom }}
                </div>
              </div>
              <div class="agent-matricule">
                <span class="matricule-chip">{{ agent.matricule }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div v-if="selectionError" class="error-message">
        {{ selectionError }}
      </div>
    </section>

    <section class="inventaire-section">
      <div class="section-header">
        <h2>Engin à inventorier</h2>
        <div class="selection-count">
          {{ selectedVehicle ? `Sélectionné : ${selectedVehicle}` : 'Aucun engin sélectionné' }}
        </div>
      </div>

      <div v-if="inventaireLoading" class="loading-message">
        Chargement des engins...
      </div>
      <div v-else-if="inventaireError" class="error-message">
        {{ inventaireError }}
      </div>
      <div v-else class="vehicle-list">
        <button
          v-for="vehicle in vehicles"
          :key="vehicle"
          type="button"
          class="vehicle-item"
          :class="{ selected: selectedVehicle === vehicle }"
          :disabled="!vehiclesDisponibles.includes(vehicle)"
          @click="selectedVehicle = vehicle"
        >
          {{ vehicle }}
        </button>
      </div>

      <div class="launch-wrapper">
        <button
          type="button"
          class="launch-button"
          :disabled="!canLaunch"
          @click="launchInventaire"
        >
          Lancer l'inventaire
        </button>
        <p v-if="!canLaunch" class="launch-hint">
          Sélectionnez 4 agents et un engin pour continuer.
        </p>
      </div>
    </section>
      </template>
      <template v-else>
        <section class="inventaire-section">
          <div class="disconnect-row" v-if="isInventaireurConnected">
            <button type="button" class="disconnect-button" @click="handleDeconnexion">
              Déconnexion
            </button>
          </div>
          <div class="section-header">
            <h2>Connexion</h2>
            <div class="selection-count" v-if="inventaireData?.vehicule">
              Inventaire en cours · {{ inventaireData.vehicule }}
            </div>
          </div>

          <div v-if="inventaireData" class="inventaire-info">
            <div class="info-item">
              <span class="info-label">Heure de début :</span>
              <span>{{ formatDateTime(inventaireData.heureDebut) }}</span>
            </div>
          </div>

          <div v-if="!isInventaireurConnected" class="connexion-form">
            <label class="input-label" for="inventaireMatricule">Indiquez votre matricule</label>
            <div class="connexion-input">
              <input
                id="inventaireMatricule"
                type="text"
                v-model="connexionMatricule"
                @keyup.enter="handleConnexion"
                autocomplete="off"
                class="text-input"
                placeholder="Ex: V30001"
              />
              <button type="button" class="launch-button" @click="handleConnexion">
                Connexion
              </button>
            </div>
            <div v-if="connexionError" class="error-message">
              {{ connexionError }}
            </div>
          </div>
          <div v-else class="success-message">
            Connecté en tant que {{ formatAgentDisplay(connectedAgent) }}
          </div>

          <div v-if="isInventaireurConnected && !selectedZone" class="zones-section">
            <div class="section-header">
              <h3>Zones d'inventaire</h3>
            </div>
            <div class="zones-progress">
              <div class="zones-progress-header">
                <span>Progression des zones</span>
                <span>{{ zonesProgress.done }} / {{ zonesProgress.total }} terminées</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill zones-progress-fill" :style="{ width: `${zonesProgress.percent}%` }"></div>
              </div>
            </div>
            <div class="zones-grid">
              <button
                v-for="zone in zonesList"
                :key="zone.key"
                class="zone-card"
                :class="zoneStatusClass(zone)"
                type="button"
                :disabled="!canOpenZone(zone)"
                @click="openZone(zone)"
              >
                <div class="zone-card-main">
                  <div class="zone-icon-box">
                    <img
                      v-if="getZoneIconUrl(zone) && !zoneIconErrors[zone.key]"
                      :src="getZoneIconUrl(zone)"
                      :alt="`Illustration ${zone.nomZone}`"
                      class="zone-illustration"
                      @error="markZoneIconError(zone.key)"
                    />
                    <div v-else class="zone-icon-placeholder"></div>
                  </div>
                  <div class="zone-card-content">
                    <div class="zone-title-row">
                      <div class="zone-title-wrap">
                        <div class="zone-title">{{ zone.nomZone }}</div>
                        <div class="zone-result-tag" :class="zoneResultClass(zone)">
                          {{ zoneResultLabel(zone) }}
                        </div>
                      </div>
                    </div>
                    <div class="zone-status">
                      <template v-if="zone.status === 'LOCKED'">
                        <template v-if="canResumeZone(zone)">
                          <span class="zone-highlight">Reprendre cette section</span>
                        </template>
                        <template v-else>
                          Cette section est verrouillée par
                          <span class="zone-agent">
                            <img
                              v-if="zone.infoInventateur?.grade"
                              :src="gradeImage(zone.infoInventateur.grade)"
                              :alt="zone.infoInventateur.grade"
                              class="zone-grade-icon"
                            />
                            <span>{{ formatAgentDisplay(zone.infoInventateur) }}</span>
                          </span>
                        </template>
                      </template>
                      <template v-else-if="zone.status === 'DONE'">
                        Terminée · reprise possible
                        <span class="zone-agent">
                          <img
                            v-if="zone.infoInventateur?.grade"
                            :src="gradeImage(zone.infoInventateur.grade)"
                            :alt="zone.infoInventateur.grade"
                            class="zone-grade-icon"
                          />
                          <span>{{ formatAgentDisplay(zone.infoInventateur) }}</span>
                        </span>
                      </template>
                      <template v-else>
                        Disponible
                      </template>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div v-if="isInventaireurConnected && !selectedZone && allZonesDone" class="zone-summary global-summary">
            <div class="zone-summary-title">Synthèse de l'inventaire</div>
            <div class="zone-summary-scroll">
              <div class="zone-summary-scroll-header">
                <span>Progression du récapitulatif</span>
                <span>
                  {{ globalSummaryProgress.done }} / {{ globalSummaryProgress.total }} ({{ globalSummaryProgress.percent }} %)
                </span>
              </div>
              <div class="progress-track">
                <div class="progress-fill zones-progress-fill" :style="{ width: `${globalSummaryProgress.percent}%` }"></div>
              </div>
              <div class="zone-summary-grid global-summary-grid">
                <button
                  v-for="summary in globalSummaryItems"
                  :key="summary.item.codeMateriel || `${summary.zoneKey}-${summary.index}`"
                  type="button"
                  class="zone-summary-card click-feedback"
                  @click="editGlobalItem(summary)"
                >
                  <div class="zone-summary-name">{{ summary.item.nomMateriel }}</div>
                  <div class="zone-summary-meta">
                    {{ summary.zoneName }} · {{ summary.item.codeMateriel }} · {{ summary.item.qteMateriel }}
                  </div>
                  <div class="zone-summary-status" :class="summary.status === 'NOK' ? 'nok' : 'ok'">
                    {{ summary.status || 'PENDING' }}
                  </div>
                  <div v-if="summary.item.commentaireInventaire" class="zone-summary-comment">
                    {{ summary.item.commentaireInventaire }}
                  </div>
                </button>
              </div>
            </div>
            <div class="zone-final">
              <label class="input-label">Commentaire global (recommandé)</label>
              <textarea
                class="text-area"
                v-model="inventaireCommentaire"
                rows="3"
                placeholder="Ajouter un commentaire de fin d'inventaire"
              ></textarea>
              <button
                type="button"
                class="launch-button"
                :disabled="submitLoading"
                @click="submitInventaire"
              >
                {{ submitLoading ? 'Validation...' : 'Valider l\'inventaire' }}
              </button>
              <div v-if="submitError" class="error-message">
                {{ submitError }}
              </div>
            </div>
          </div>

          <div v-if="isInventaireurConnected && selectedZone" class="zone-detail">
            <div class="section-header">
              <h3>{{ selectedZone.nomZone }}</h3>
              <button type="button" class="return-button" @click="closeZone">
                Retour
              </button>
            </div>
            <div class="progress-bar">
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: `${zoneProgress}%` }"></div>
              </div>
              <span class="progress-label">{{ zoneProgress }} %</span>
            </div>
            <div v-if="selectedZone.key === 'etat_vehicule'" class="etat-vehicule-section">
              <div class="etat-grid">
                <div class="etat-field">
                  <label class="input-label" for="kilometrage">Kilométrage</label>
                  <input
                    id="kilometrage"
                    type="number"
                    class="text-input compact-number-input"
                    v-model="etatVehicule.kilometrage"
                    @change="saveEtatVehicule"
                    placeholder="Km"
                    min="0"
                  />
                </div>

                <div class="etat-field">
                  <div class="toggle-row">
                    <label class="toggle-label">
                      <input
                        type="checkbox"
                        v-model="etatVehicule.carrosserie.ok"
                        @change="saveEtatVehicule"
                      />
                      Carrosserie : aucun problème
                    </label>
                  </div>
                  <input
                    v-if="!etatVehicule.carrosserie.ok"
                    type="text"
                    class="text-input"
                    v-model="etatVehicule.carrosserie.commentaire"
                    @change="saveEtatVehicule"
                    placeholder="Commentaire carrosserie"
                  />
                </div>

                <div class="etat-field">
                  <div class="toggle-row">
                    <label class="toggle-label">
                      <input
                        type="checkbox"
                        v-model="etatVehicule.interieur.ok"
                        @change="saveEtatVehicule"
                      />
                      Intérieur : aucun problème
                    </label>
                  </div>
                  <input
                    v-if="!etatVehicule.interieur.ok"
                    type="text"
                    class="text-input"
                    v-model="etatVehicule.interieur.commentaire"
                    @change="saveEtatVehicule"
                    placeholder="Commentaire intérieur"
                  />
                </div>

                <div class="etat-field">
                  <div class="toggle-row">
                    <label class="toggle-label">
                      <input
                        type="checkbox"
                        v-model="etatVehicule.carrosserieNettoyee"
                        @change="saveEtatVehicule"
                      />
                      Carrosserie nettoyée
                    </label>
                  </div>
                </div>

                <div class="etat-field">
                  <div class="toggle-row">
                    <label class="toggle-label">
                      <input
                        type="checkbox"
                        v-model="etatVehicule.eclairageExterieur"
                        @change="saveEtatVehicule"
                      />
                      Éclairages extérieurs OK
                    </label>
                  </div>
                  <input
                    v-if="!etatVehicule.eclairageExterieur"
                    type="text"
                    class="text-input"
                    v-model="etatVehicule.eclairageExterieurCommentaire"
                    @change="saveEtatVehicule"
                    placeholder="Commentaire éclairages extérieurs"
                  />
                  <div class="toggle-row">
                    <label class="toggle-label">
                      <input
                        type="checkbox"
                        v-model="etatVehicule.eclairageInterieur"
                        @change="saveEtatVehicule"
                      />
                      Éclairages intérieurs OK
                    </label>
                  </div>
                  <input
                    v-if="!etatVehicule.eclairageInterieur"
                    type="text"
                    class="text-input"
                    v-model="etatVehicule.eclairageInterieurCommentaire"
                    @change="saveEtatVehicule"
                    placeholder="Commentaire éclairages intérieurs"
                  />
                </div>

                <div class="etat-field">
                  <div class="toggle-row">
                    <label class="toggle-label">
                      <input
                        type="checkbox"
                        v-model="etatVehicule.demarrageThermique"
                        @change="saveEtatVehicule"
                      />
                      Démarrage ensemble thermique OK
                    </label>
                  </div>
                </div>

                <div class="etat-field">
                  <label class="input-label" for="carburant">Niveau de carburant (sur 8)</label>
                  <div class="range-row">
                    <input
                      id="carburant"
                      type="range"
                      min="0"
                      max="8"
                      step="1"
                      v-model.number="etatVehicule.niveauCarburant"
                      @change="saveEtatVehicule"
                    />
                    <span class="range-value">{{ etatVehicule.niveauCarburant }}/8</span>
                  </div>
                </div>
              </div>
              <div class="zone-top-actions">
                <button
                  type="button"
                  class="launch-button"
                  @click="completeEtatVehicule"
                >
                  Valider l'état du véhicule
                </button>
              </div>
              <div v-if="etatVehiculeError" class="error-message">
                {{ etatVehiculeError }}
              </div>
            </div>
            <div v-else class="item-screen">
              <div v-if="!currentItem" class="zone-empty">
                <div>Zone terminée.</div>
                <div class="zone-summary">
                  <div class="zone-summary-title">Récapitulatif</div>
                  <div class="zone-summary-grid">
                    <button
                      v-for="summary in zoneSummaryItems"
                      :key="summary.item.codeMateriel || summary.index"
                      type="button"
                      class="zone-summary-card click-feedback"
                      @click="editZoneItem(summary.index)"
                    >
                      <div class="zone-summary-name">{{ summary.item.nomMateriel }}</div>
                      <div class="zone-summary-meta">
                        {{ summary.item.codeMateriel }} · {{ summary.item.qteMateriel }}
                      </div>
                      <div class="zone-summary-status" :class="summary.status === 'NOK' ? 'nok' : 'ok'">
                        {{ summary.status || 'PENDING' }}
                      </div>
                      <div v-if="summary.item.commentaireInventaire" class="zone-summary-comment">
                        {{ summary.item.commentaireInventaire }}
                      </div>
                    </button>
                  </div>
                </div>
                <button type="button" class="launch-button zone-close-button" @click="closeZone">
                  Revenir au menu
                </button>
              </div>
              <div v-else class="item-content">
                  <div class="swipe-card-wrapper">
                  <div
                    class="swipe-card"
                    :class="{
                      dragging: swipeActive,
                      disabled: showIssueForm,
                      'tone-ok': swipeOffset >= SWIPE_TONE_OFFSET,
                      'tone-pb': swipeOffset <= -SWIPE_TONE_OFFSET
                    }"
                    :style="swipeCardStyle"
                      @pointerdown="onSwipeStart"
                      @pointermove="onSwipeMove"
                      @pointerup="handleSwipeEnd"
                      @pointercancel="handleSwipeEnd"
                      @touchstart="onSwipeTouchStart"
                      @touchmove="onSwipeTouchMove"
                      @touchend="handleSwipeEnd"
                      @touchcancel="handleSwipeEnd"
                  >
                    <div class="item-chip">{{ selectedZone.nomZone }}</div>
                    <div class="item-title">{{ currentItem.item.nomMateriel }}</div>
                    <div class="item-meta">
                      Quantité : {{ currentItem.item.qteMateriel }}
                    </div>
                    <div v-if="currentItem.item.commentaire" class="item-comment">
                      {{ currentItem.item.commentaire }}
                    </div>
                    <div v-if="String(currentItem.item.isPeremption) === '1'" class="expiry-warning">
                      <img :src="ExpiryIcon" alt="Péremption" class="expiry-icon" />
                      Bien vérifier la date de péremption
                    </div>

                    <div v-if="isDemandeSpe(currentItem.item, 'nivO2')" class="special-section">
                      <div class="special-title">Niveau O2</div>
                      <div class="chip-group">
                        <button
                          v-for="level in ['Vert', 'Jaune', 'Rouge']"
                          :key="level"
                          type="button"
                          class="chip"
                          :class="{ active: o2Level === level }"
                          @click.stop="o2Level = level"
                        >
                          {{ level }}
                        </button>
                      </div>
                      <div v-if="o2Level === 'Rouge'" class="special-warning">
                        La bouteille doit être changée. Le chef de garde
                        {{ formatAgentDisplay(chefDeGardeAgent) }} doit faire une commande auprès du guichet unique
                        <span class="special-email">guichet.unique@sdmis.fr</span>.
                      </div>
                    </div>

                    <div v-if="isDemandeSpe(currentItem.item, 'nivDSA')" class="special-section">
                      <div class="special-title">Niveau batterie DSA</div>
                      <div class="range-row">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          v-model.number="dsaLevel"
                          @click.stop
                        />
                        <span class="range-value">{{ dsaLevel }}/5</span>
                      </div>
                    </div>

                    <div v-if="isDemandeSpe(currentItem.item, 'asup')" class="special-section">
                      <div class="special-title">Contrôle ASUP</div>
                      <div v-if="asupLoading" class="loading-message">Chargement ASUP...</div>
                      <div v-else-if="asupError" class="error-message">{{ asupError }}</div>
                      <div v-else>
                        <div class="asup-checks">
                          <div v-for="lot in asupLots" :key="lot.numLot" class="asup-lot">
                            <label class="asup-check">
                              <input
                                type="checkbox"
                                v-model="asupChecks[lot.numLot]"
                                @click.stop
                              />
                              <div class="asup-lot-lines">
                                <div class="asup-lot-line">
                                  <img :src="LotIcon" alt="Lot" />
                                  <span>{{ lot.numLot }}</span>
                                </div>
                                <div class="asup-lot-line">
                                  <img :src="ExpiryIcon" alt="Péremption" />
                                  <span>{{ formatShortDate(lot.datePeremption) }}</span>
                                </div>
                                <div class="asup-lot-line">
                                  <span>{{ lot.count }} médicament{{ lot.count > 1 ? 's' : '' }}</span>
                                </div>
                              </div>
                            </label>
                            <div v-if="lot.statutAsup === 3" class="special-warning">
                              Lot {{ lot.numLot }} {{ formatDaysUntil(daysUntil(lot.datePeremption)) }}.
                              Assurez-vous que {{ lot.count > 1 ? 'les médicaments soient bien retirés' : 'le médicament soit bien retiré' }} du sac avant de cocher.
                              Les responsables ASUP seront prévenus automatiquement.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="showIssueForm" class="issue-form">
                  <div class="special-title">Signaler un problème</div>
                  <div class="issue-cards-grid">
                    <button
                      v-for="option in issueOptions"
                      :key="option.key"
                      type="button"
                      class="issue-card"
                      :class="{ active: issueSelections[option.key] }"
                      @click="toggleIssueOption(option.key)"
                    >
                      <div class="issue-card-title">{{ option.title }}</div>
                      <div class="issue-card-description">{{ option.description }}</div>
                    </button>
                  </div>

                  <div v-if="issueSelections.reserve || issueSelections.peremption" class="issue-field">
                    <label class="input-label">Indiquez le nombre d'items pris depuis la réserve :</label>
                    <input
                      type="number"
                      class="text-input compact-number-input"
                      v-model="issueReserveCount"
                      min="0"
                    />
                  </div>

                  <div v-if="issueSelections.defectueux" class="issue-field">
                    <label class="input-label">Commentaire</label>
                    <input type="text" class="text-input" v-model="issueComment" />
                  </div>

                  <div class="issue-actions">
                    <button type="button" class="launch-button" @click="submitIssue">
                      Valider le problème
                    </button>
                    <button type="button" class="return-button" @click="cancelIssue">
                      Annuler
                    </button>
                  </div>
                </div>

                <div v-if="itemError" class="error-message">
                  {{ itemError }}
                </div>

                <div class="item-actions">
                  <button type="button" class="return-button" @click="goToPreviousItem">
                    Précédent
                  </button>
                </div>

                <div v-if="!showIssueForm" class="swipe-hint">
                  Glissez la carte vers la droite si OK, vers la gauche si problème.
                </div>
              </div>
            </div>
          </div>

        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { db } from '@/firebase/config';
import { ref as dbRef, get, onValue, set, update } from 'firebase/database';

import Sap2CL from '@/assets/grades/Sap 2CL.png';
import Sap1CL from '@/assets/grades/Sap 1CL.png';
import Caporal from '@/assets/grades/Caporal.png';
import CaporalChef from '@/assets/grades/Caporal-Chef.png';
import Sergent from '@/assets/grades/Sergent.png';
import SergentChef from '@/assets/grades/Sergent-Chef.png';
import Adjudant from '@/assets/grades/Adjudant.png';
import AdjudantChef from '@/assets/grades/Adjudant-Chef.png';
import Lieutenant from '@/assets/grades/Lieutenant.png';
import Capitaine from '@/assets/grades/Capitaine.png';
import Commandant from '@/assets/grades/Commandant.png';
import Infirmiere from '@/assets/grades/Infirmière.png';
import Professeur from '@/assets/grades/Professeur.png';
import ExpiryIcon from '@/assets/icons/expiry.svg';
import LotIcon from '@/assets/icons/Lot.png';

const AGENTS_URL = 'https://opensheet.elk.sh/1-S_8VCPQ76y3XTiK1msvjoglv_uJVGmRNvUZMYvmCnE/Feuille%2012';
const INVENTAIRE_URL = 'https://api.cms-collonges.fr/inventaireVehicule';

const statusLegend = [
  { key: 'DIP', short: 'DIP', label: 'Disponibilité Programmée', color: '#9CFF9C' },
  { key: 'AEC', short: 'AEC', label: 'Alertable en complément', color: '#FFCC00' },
  { key: 'AOR', short: 'AOR', label: 'Alertable pour relève', color: '#FFA500' },
  { key: 'IN', short: 'IN/IND', label: 'Indisponible', color: '#4A4A4A' }
];

const agents = ref([]);
const agentsLoading = ref(false);
const agentsError = ref('');

const inventaireParVehicule = ref({});
const enginsStatus = ref([]);
const inventaireLoading = ref(false);
const inventaireError = ref('');

const inventaireData = ref(null);
const firebaseLoading = ref(true);
const firebaseError = ref('');

const selectedAgents = ref([]);
const selectedVehicle = ref('');
const selectionError = ref('');

const connexionMatricule = ref('');
const connexionError = ref('');
const connectedMatricule = ref('');
const connectedAgent = ref(null);
const etatVehiculeError = ref('');

const gradeImages = {
  'Sap 2CL': Sap2CL,
  'Sap 1CL': Sap1CL,
  'Caporal': Caporal,
  'Caporal-Chef': CaporalChef,
  'Sergent': Sergent,
  'Sergent-Chef': SergentChef,
  'Adjudant': Adjudant,
  'Adjudant-Chef': AdjudantChef,
  'Lieutenant': Lieutenant,
  'Capitaine': Capitaine,
  'Commandant': Commandant,
  'Infirmière': Infirmiere,
  'Professeur': Professeur
};

const gradeRank = {
  'Sap 2CL': 1,
  'Sap 1CL': 2,
  'Caporal': 3,
  'Caporal-Chef': 4,
  'Sergent': 5,
  'Sergent-Chef': 6,
  'Adjudant': 7,
  'Adjudant-Chef': 8,
  'Lieutenant': 9,
  'Capitaine': 10,
  'Commandant': 11
};

const normalizeStatus = (status) => {
  if (!status) return 'IN';
  if (status === 'IND') return 'IN';
  return status;
};

const formatAgentName = (agent) => {
  return `${agent.grade} ${agent.nom} ${agent.prenom} (${agent.matricule})`;
};

const formatAgentDisplay = (agent) => {
  if (!agent) return '—';
  const nom = agent.nom || '';
  const prenom = agent.prenom || '';
  return `${nom} ${prenom}`.trim();
};

const gradeImage = (grade) => {
  return gradeImages[grade] || '';
};

const isSelected = (agent) => {
  return selectedAgents.value.some((selected) => selected.matricule === agent.matricule);
};

const toggleAgent = (agent) => {
  const index = selectedAgents.value.findIndex(
    (selected) => selected.matricule === agent.matricule
  );

  if (index !== -1) {
    selectedAgents.value.splice(index, 1);
    selectionError.value = '';
    return;
  }

  if (selectedAgents.value.length >= 4) {
    selectionError.value = 'Vous pouvez sélectionner 4 agents maximum.';
    return;
  }

  selectedAgents.value.push(agent);
  selectionError.value = '';
};

const groupedAgents = computed(() => {
  return statusLegend.map((statusConfig) => {
    const items = agents.value.filter((agent) => {
      return normalizeStatus(agent.status) === statusConfig.key;
    });

    return {
      ...statusConfig,
      items
    };
  });
});

const chefDeGarde = computed(() => {
  if (selectedAgents.value.length === 0) {
    return null;
  }

  return selectedAgents.value.reduce((currentBest, candidate) => {
    if (!currentBest) return candidate;
    const bestRank = gradeRank[currentBest.grade] || 0;
    const candidateRank = gradeRank[candidate.grade] || 0;
    if (candidateRank > bestRank) {
      return candidate;
    }
    return currentBest;
  }, null);
});

const inventaireurs = computed(() => {
  if (!chefDeGarde.value) {
    return [];
  }

  return selectedAgents.value
    .filter((agent) => agent.matricule !== chefDeGarde.value.matricule)
    .slice(0, 3);
});

const inventaireur1 = computed(() => inventaireurs.value[0] || null);
const inventaireur2 = computed(() => inventaireurs.value[1] || null);
const inventaireur3 = computed(() => inventaireurs.value[2] || null);

const expandedStatus = ref({
  DIP: true,
  AEC: false,
  AOR: false,
  IN: false
});

const toggleGroup = (group) => {
  if (!group?.key) return;
  if (!Array.isArray(group.items) || group.items.length === 0) return;
  expandedStatus.value[group.key] = !expandedStatus.value[group.key];
};

const canLaunch = computed(() => {
  return selectedAgents.value.length === 4 && Boolean(selectedVehicle.value);
});

const hasInventaire = computed(() => Boolean(inventaireData.value));

const subtitleText = computed(() => {
  return hasInventaire.value
    ? 'Un inventaire est en cours. Connectez-vous pour continuer.'
    : 'Sélectionnez 4 agents et un engin pour préparer l\'inventaire.';
});

const vehicles = computed(() => {
  if (enginsStatus.value.length) {
    return enginsStatus.value
      .filter((engin) => engin.hidden === false)
      .map((engin) => engin.engin);
  }
  return Object.keys(inventaireParVehicule.value);
});

const vehiclesDisponibles = computed(() => {
  if (!enginsStatus.value.length) return vehicles.value;
  return enginsStatus.value
    .filter((engin) => engin.hidden === false && engin.status === 'ACTIVATED' && engin.sheetFound)
    .map((engin) => engin.engin);
});

const agentsByMatricule = computed(() => {
  return agents.value.reduce((acc, agent) => {
    acc[normalizeMatricule(agent.matricule)] = agent;
    return acc;
  }, {});
});

const getZoneSortOrder = (zone) => {
  if (!zone || zone.status !== 'DONE') return 0;
  const materiels = Array.isArray(zone.materiels) ? zone.materiels : [];
  const relevant = materiels.filter((item) => String(item.noCheck) !== '1');
  const hasProblem = relevant.some((item) => item.statutInventaire === 'NOK');
  return hasProblem ? 2 : 1;
};

const isLotPsInventaire = computed(() => {
  const vehicule = inventaireData.value?.vehicule || selectedVehicle.value || '';
  return formatEnginAssetName(vehicule) === 'LOTPS';
});

const zonesList = computed(() => {
  const zones = inventaireData.value?.zones || {};
  return Object.entries(zones).map(([key, zone]) => ({
    key,
    ...zone
  })).filter((zone) => {
    if (!isLotPsInventaire.value) return true;
    return zone.codeZone !== 'ETAT_VEHICULE';
  }).sort((a, b) => {
    const orderDiff = getZoneSortOrder(a) - getZoneSortOrder(b);
    if (orderDiff !== 0) {
      return orderDiff;
    }
    const nameA = a.nomZone || a.codeZone || '';
    const nameB = b.nomZone || b.codeZone || '';
    return nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' });
  });
});

const zoneIconErrors = ref({});
const zonesProgress = computed(() => {
  const total = zonesList.value.length;
  const done = zonesList.value.filter((zone) => zone.status === 'DONE').length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, percent };
});

const zoneHasProblem = (zone) => {
  if (!zone) return false;
  const materiels = Array.isArray(zone.materiels) ? zone.materiels : [];
  const relevant = materiels.filter((item) => String(item.noCheck) !== '1');
  return relevant.some((item) => item.statutInventaire === 'NOK');
};

const zoneResultLabel = (zone) => {
  if (!zone) return 'À faire';
  if (zone.status === 'DONE') {
    return zoneHasProblem(zone) ? 'Problème' : 'Okay';
  }
  if (zone.status === 'LOCKED') return 'En cours';
  return 'À faire';
};

const zoneResultClass = (zone) => {
  if (!zone) return 'is-pending';
  if (zone.status === 'DONE') {
    return zoneHasProblem(zone) ? 'is-problem' : 'is-okay';
  }
  if (zone.status === 'LOCKED') return 'is-progress';
  return 'is-pending';
};

const isInventaireurConnected = computed(() => Boolean(connectedMatricule.value));
const selectedZoneKey = ref('');
const selectedZone = computed(() => {
  if (!selectedZoneKey.value) return null;
  return zonesList.value.find((zone) => zone.key === selectedZoneKey.value) || null;
});

const currentItemIndex = ref(0);
const swipeOffset = ref(0);
const swipeActive = ref(false);
const swipeStartX = ref(0);
const swipeFromAsupControl = ref(false);
const swipePointerId = ref(null);
const swipeTouchId = ref(null);
const itemError = ref('');
const showIssueForm = ref(false);
const issueSelections = ref({
  reserve: false,
  commande: false,
  peremption: false,
  defectueux: false
});
const issueComment = ref('');
const issueReserveCount = ref('');
const issueOptionDefinitions = [
  {
    key: 'reserve',
    title: 'Réserve',
    description: 'Matériel manquant, ajout depuis la réserve'
  },
  {
    key: 'commande',
    title: 'Commande',
    description: 'Matériel manquant, à commander'
  },
  {
    key: 'peremption',
    title: 'Péremption',
    description: 'Date de péremption < 2 mois',
    peremptionOnly: true
  },
  {
    key: 'defectueux',
    title: 'Défectueux',
    description: 'Matériel défectueux'
  }
];
const inventaireCommentaire = ref('');
const submitError = ref('');
const submitLoading = ref(false);
const submitSuccessMessage = ref('');
const o2Level = ref('');
const dsaLevel = ref(0);
const asupChecks = ref({});
const asupData = ref([]);
const asupLoading = ref(false);
const asupError = ref('');
const SWIPE_MAX_OFFSET = 150;
const SWIPE_TRIGGER_OFFSET = 45;
const SWIPE_TONE_OFFSET = 16;
const SWIPE_SENSITIVITY = 1.3;
const SWIPE_ROTATION_DIVISOR = 10;

const asupLots = computed(() => {
  const grouped = {};
  asupData.value.forEach((item) => {
    const lot = String(item.numLot || 'INCONNU');
    if (!grouped[lot]) {
      grouped[lot] = {
        numLot: lot,
        datePeremption: item.datePeremption || '',
        statutAsup: Number(item.idStatutAsup || 0),
        count: 0
      };
    }
    grouped[lot].count += 1;
    if (Number(item.idStatutAsup || 0) === 3) {
      grouped[lot].statutAsup = 3;
    }
  });
  return Object.values(grouped);
});

const chefDeGardeAgent = computed(() => {
  const matricule = normalizeMatricule(inventaireData.value?.chefDeGarde);
  if (!matricule) return null;
  return agentsByMatricule.value[matricule] || { matricule };
});

const zoneItems = computed(() => {
  if (!selectedZone.value || selectedZone.value.key === 'etat_vehicule') {
    return [];
  }
  const items = selectedZone.value.materiels || [];
  return items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => String(item.noCheck) !== '1');
});

const swipeCardStyle = computed(() => {
  if (showIssueForm.value) {
    return {};
  }
  const rotate = swipeOffset.value / SWIPE_ROTATION_DIVISOR;
  return {
    transform: `translate3d(${swipeOffset.value}px, 0, 0) rotate(${rotate}deg)`
  };
});

const currentItem = computed(() => {
  if (!zoneItems.value.length) return null;
  return zoneItems.value[currentItemIndex.value] || null;
});

const issueOptions = computed(() => {
  return issueOptionDefinitions.filter((option) => {
    if (!option.peremptionOnly) return true;
    return String(currentItem.value?.item?.isPeremption) === '1';
  });
});

const zoneSummaryItems = computed(() => {
  if (!selectedZone.value) return [];
  return zoneItems.value.map(({ item, index }) => ({
    item,
    index,
    status: item.statutInventaire || ''
  }));
});

const globalSummaryItems = computed(() => {
  const zones = inventaireData.value?.zones || {};
  const items = [];
  Object.entries(zones).forEach(([key, zone]) => {
    if (zone.codeZone === 'ETAT_VEHICULE') return;
    const materiels = Array.isArray(zone.materiels) ? zone.materiels : [];
    materiels.forEach((item, index) => {
      items.push({
        zoneKey: key,
        zoneName: zone.nomZone || zone.codeZone || 'Zone',
        item,
        index,
        status: item.statutInventaire || ''
      });
    });
  });
  return items;
});

const globalSummaryProgress = computed(() => {
  const total = globalSummaryItems.value.length;
  const done = globalSummaryItems.value.filter((summary) => {
    return summary.status === 'OK' || summary.status === 'NOK';
  }).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, percent };
});

const allZonesDone = computed(() => {
  const zones = inventaireData.value?.zones || {};
  return Object.values(zones).every((zone) => {
    if (!zone) return false;
    if (zone.codeZone === 'ETAT_VEHICULE') {
      if (isLotPsInventaire.value) return true;
      return zone.status === 'DONE';
    }
    const materiels = Array.isArray(zone.materiels) ? zone.materiels : [];
    const relevant = materiels.filter((item) => String(item.noCheck) !== '1');
    if (relevant.length === 0) {
      return true;
    }
    return zone.status === 'DONE';
  });
});

const zoneProgress = computed(() => {
  if (!selectedZone.value) return 0;
  const items = selectedZone.value.key === 'etat_vehicule'
    ? (selectedZone.value.materiels || [])
    : zoneItems.value.map(({ item }) => item);
  if (items.length === 0) return 0;
  const doneCount = items.filter((item) => item.statutInventaire === 'OK' || item.statutInventaire === 'NOK').length;
  return Math.round((doneCount / items.length) * 100);
});

const mapInventaireVehicule = (rawData) => {
  const mapped = {};

  Object.entries(rawData).forEach(([key, rows]) => {
    if (key === 'Historique' || key === 'enginsStatus') {
      return;
    }
    if (!Array.isArray(rows) || rows.length === 0) {
      mapped[key] = [];
      return;
    }

    const headers = rows[0];
    mapped[key] = rows.slice(1).map((row) => {
      return headers.reduce((acc, header, index) => {
        acc[header] = row[index] ?? '';
        return acc;
      }, {});
    });
  });

  return mapped;
};

const normalizeMatricule = (matricule) => {
  return String(matricule || '').trim().toUpperCase();
};

const normalizeAssetPart = (value) => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const formatEnginAssetName = (value) => {
  return normalizeAssetPart(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
};

const formatZoneAssetName = (value) => {
  return normalizeAssetPart(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

const getZoneIconUrl = (zone) => {
  if (!zone) return '';
  const enginSlug = formatEnginAssetName(inventaireData.value?.vehicule || selectedVehicle.value);
  const zoneSlug = formatZoneAssetName(zone.codeZone || zone.key || zone.nomZone);
  if (!enginSlug || !zoneSlug) return '';
  return `https://github.com/lr-can/affichageCT/blob/main/${enginSlug}_${zoneSlug}.png?raw=true`;
};

const markZoneIconError = (zoneKey) => {
  if (!zoneKey) return;
  zoneIconErrors.value = {
    ...zoneIconErrors.value,
    [zoneKey]: true
  };
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('fr-FR');
};

const formatZoneName = (codeZone) => {
  const raw = String(codeZone || '').replace(/_/g, ' ').trim();
  if (!raw) return 'Default';
  return raw.replace(/\b\w/g, (char) => char.toUpperCase());
};

const buildZoneKey = (codeZone) => {
  const base = String(codeZone || 'default').trim() || 'default';
  return base.replace(/[[\]#.$/]/g, '_');
};

function resetItemState() {
  swipeOffset.value = 0;
  swipeFromAsupControl.value = false;
  swipePointerId.value = null;
  swipeTouchId.value = null;
  itemError.value = '';
  showIssueForm.value = false;
  issueSelections.value = {
    reserve: false,
    commande: false,
    peremption: false,
    defectueux: false
  };
  issueComment.value = '';
  issueReserveCount.value = '';
  o2Level.value = '';
  dsaLevel.value = 0;
  asupChecks.value = {};
  asupData.value = [];
  asupLoading.value = false;
  asupError.value = '';
}

function getFirstPendingIndex() {
  const index = zoneItems.value.findIndex(({ item }) => {
    return item.statutInventaire !== 'OK' && item.statutInventaire !== 'NOK';
  });
  return index === -1 ? zoneItems.value.length : index;
}

function getNextPendingIndex(startIndex) {
  for (let i = startIndex; i < zoneItems.value.length; i += 1) {
    const item = zoneItems.value[i].item;
    if (item.statutInventaire !== 'OK' && item.statutInventaire !== 'NOK') {
      return i;
    }
  }
  return zoneItems.value.length;
}

function getPreviousIndex(startIndex) {
  for (let i = startIndex; i >= 0; i -= 1) {
    return i;
  }
  return -1;
}

function getDemandeSpeValue(item) {
  return String(item?.demandeSpe || '').trim();
}

function isDemandeSpe(item, value) {
  const raw = getDemandeSpeValue(item);
  if (!raw) return false;
  return raw.split(',').map((part) => part.trim()).includes(value);
}

function isAsupRequest(item) {
  return isDemandeSpe(item, 'asup');
}

function formatShortDate(dateValue) {
  if (!dateValue) return '—';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString('fr-FR');
}

function daysUntil(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDaysUntil(days) {
  if (days === null || days === undefined) return '—';
  if (days < 0) return `périmé depuis ${Math.abs(days)} jours`;
  return `périme dans ${days} jours`;
}

const defaultEtatVehicule = () => ({
  kilometrage: '',
  carrosserie: {
    ok: true,
    commentaire: ''
  },
  interieur: {
    ok: true,
    commentaire: ''
  },
  carrosserieNettoyee: true,
  eclairageExterieur: true,
  eclairageExterieurCommentaire: '',
  eclairageInterieur: true,
  eclairageInterieurCommentaire: '',
  demarrageThermique: true,
  niveauCarburant: 8
});

const etatVehicule = ref(defaultEtatVehicule());

const getZoneLocker = (zone) => {
  if (!zone || !zone.infoInventateur) return null;
  return zone.infoInventateur;
};

const canResumeZone = (zone) => {
  if (!zone || zone.status !== 'LOCKED') return false;
  const zoneLocker = getZoneLocker(zone);
  if (!zoneLocker) return false;
  return normalizeMatricule(zoneLocker.matricule) === connectedMatricule.value;
};

const zoneStatusClass = (zone) => {
  if (!zone || !zone.status) return 'zone-pending';
  return `zone-${zone.status.toLowerCase()}`;
};

const canOpenZone = (zone) => {
  if (!zone) return false;
  if (zone.status === 'LOCKED') {
    return canResumeZone(zone);
  }
  return true;
};

const fetchAgents = async () => {
  agentsLoading.value = true;
  agentsError.value = '';

  try {
    const response = await fetch(AGENTS_URL);
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des agents.');
    }
    const data = await response.json();
    agents.value = Array.isArray(data) ? data : [];
  } catch (error) {
    agentsError.value = error.message || 'Erreur inconnue lors du chargement des agents.';
  } finally {
    agentsLoading.value = false;
  }
};

const fetchInventaires = async () => {
  inventaireLoading.value = true;
  inventaireError.value = '';

  try {
    const response = await fetch(INVENTAIRE_URL);
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des inventaires.');
    }
    const data = await response.json();
    inventaireParVehicule.value = mapInventaireVehicule(data);
    enginsStatus.value = Array.isArray(data.enginsStatus) ? data.enginsStatus : [];
  } catch (error) {
    inventaireError.value = error.message || 'Erreur inconnue lors du chargement des inventaires.';
  } finally {
    inventaireLoading.value = false;
  }
};

onMounted(() => {
  fetchAgents();
  fetchInventaires();
  setupInventaireListener();
});

onUnmounted(() => {
  if (unsubscribeInventaire) {
    unsubscribeInventaire();
  }
});

let unsubscribeInventaire = null;

const setupInventaireListener = () => {
  const inventaireRef = dbRef(db, 'inventaire');
  unsubscribeInventaire = onValue(
    inventaireRef,
    (snapshot) => {
      if (snapshot.exists()) {
        inventaireData.value = snapshot.val();
      } else {
        inventaireData.value = null;
      }
      firebaseLoading.value = false;
    },
    (error) => {
      console.error('Erreur Firebase inventaire:', error);
      firebaseError.value = 'Erreur de connexion Firebase.';
      firebaseLoading.value = false;
    }
  );
};

watch(
  () => inventaireData.value,
  (newInventaire) => {
    if (!newInventaire) return;
    submitSuccessMessage.value = '';
    const zoneEtat = newInventaire?.zones?.etat_vehicule?.etatVehicule;
    const legacyEtat = newInventaire?.etatVehicule;
    const newEtat = zoneEtat || legacyEtat;
    if (newEtat) {
      etatVehicule.value = {
        ...defaultEtatVehicule(),
        ...newEtat,
        carrosserie: {
          ...defaultEtatVehicule().carrosserie,
          ...(newEtat.carrosserie || {})
        },
        interieur: {
          ...defaultEtatVehicule().interieur,
          ...(newEtat.interieur || {})
        }
      };
    }
  },
  { immediate: true }
);

watch(
  () => inventaireData.value?.vehicule || selectedVehicle.value,
  () => {
    zoneIconErrors.value = {};
  }
);

watch(
  () => selectedZoneKey.value,
  () => {
    resetItemState();
    if (zoneItems.value.length > 0) {
      currentItemIndex.value = getFirstPendingIndex();
    } else {
      currentItemIndex.value = 0;
    }
  }
);

watch(
  () => currentItem.value,
  (newItem) => {
    resetItemState();
    if (newItem && isAsupRequest(newItem.item)) {
      fetchAsupData(newItem.item);
    }
  }
);

const handleConnexion = () => {
  connexionError.value = '';
  const input = normalizeMatricule(connexionMatricule.value);
  if (!input) {
    connexionError.value = 'Veuillez entrer un matricule.';
    return;
  }
  if (!inventaireData.value || !Array.isArray(inventaireData.value.inventaireurs)) {
    connexionError.value = 'Aucun inventaire actif.';
    return;
  }
  const allowed = inventaireData.value.inventaireurs.map(normalizeMatricule);
  if (!allowed.includes(input)) {
    connexionError.value = 'Vous ne faites pas partie des inventaireurs autorisés.';
    return;
  }
  connectedMatricule.value = input;
  connectedAgent.value = agentsByMatricule.value[input] || { matricule: input };
};

const handleDeconnexion = () => {
  connectedMatricule.value = '';
  connectedAgent.value = null;
  connexionMatricule.value = '';
  connexionError.value = '';
  selectedZoneKey.value = '';
};

const saveEtatVehicule = async () => {
  etatVehiculeError.value = '';
  if (!hasInventaire.value) {
    return;
  }
  try {
    await update(dbRef(db, 'inventaire/zones/etat_vehicule/etatVehicule'), etatVehicule.value);
  } catch (error) {
    console.error('Erreur sauvegarde état véhicule:', error);
    etatVehiculeError.value = 'Impossible d\'enregistrer l\'état du véhicule.';
  }
};

const openZone = async (zone) => {
  if (!zone || !canOpenZone(zone)) {
    return;
  }
  if (!connectedAgent.value) {
    connexionError.value = 'Veuillez vous connecter pour accéder à une zone.';
    return;
  }

  const zonePath = `inventaire/zones/${zone.key}`;
  const infoInventateur = {
    matricule: connectedAgent.value.matricule || connectedMatricule.value,
    grade: connectedAgent.value.grade || '',
    nom: connectedAgent.value.nom || '',
    prenom: connectedAgent.value.prenom || ''
  };

  try {
    if (zone.status === 'DONE') {
      const confirmed = window.confirm('Confirmez la prise en charge de la zone concernée');
      if (!confirmed) return;
      await update(dbRef(db, zonePath), { infoInventateur });
    }
    if (zone.status === 'PENDING') {
      await update(dbRef(db, zonePath), {
        status: 'LOCKED',
        infoInventateur
      });
    }
    selectedZoneKey.value = zone.key;
  } catch (error) {
    console.error('Erreur ouverture zone:', error);
    connexionError.value = 'Impossible d\'ouvrir cette zone.';
  }
};

const closeZone = () => {
  selectedZoneKey.value = '';
};

const completeEtatVehicule = async () => {
  if (!selectedZone.value || selectedZone.value.key !== 'etat_vehicule') {
    return;
  }
  if (!connectedAgent.value) {
    connexionError.value = 'Veuillez vous connecter pour valider.';
    return;
  }

  const infoInventateur = {
    matricule: connectedAgent.value.matricule || connectedMatricule.value,
    grade: connectedAgent.value.grade || '',
    nom: connectedAgent.value.nom || '',
    prenom: connectedAgent.value.prenom || ''
  };

  try {
    await update(dbRef(db, 'inventaire/zones/etat_vehicule'), {
      status: 'DONE',
      infoInventateur
    });
    selectedZoneKey.value = '';
  } catch (error) {
    console.error('Erreur validation état véhicule:', error);
    connexionError.value = 'Impossible de valider l\'état du véhicule.';
  }
};

const fetchAsupData = async (item) => {
  const engin = String(inventaireData.value?.vehicule || selectedVehicle.value || '').toLowerCase();
  if (!engin) return;
  const code = item?.codeMateriel;
  if (!code) return;
  asupLoading.value = true;
  asupError.value = '';
  try {
    const response = await fetch(`https://api.cms-collonges.fr/getInventaireAsup/${code}/${engin}`);
    if (!response.ok) {
      throw new Error('Erreur chargement ASUP');
    }
    const result = await response.json();
    asupData.value = Array.isArray(result.data) ? result.data : [];
    const initialChecks = {};
    asupData.value.forEach((entry) => {
      const lot = String(entry.numLot || 'INCONNU');
      if (!(lot in initialChecks)) {
        initialChecks[lot] = false;
      }
    });
    asupChecks.value = initialChecks;
  } catch (error) {
    console.error('Erreur ASUP:', error);
    asupError.value = 'Impossible de charger les informations ASUP.';
  } finally {
    asupLoading.value = false;
  }
};

const handleSwipe = async (direction) => {
  itemError.value = '';

  if (!currentItem.value) {
    return;
  }

  if (direction === 'NOK') {
    showIssueForm.value = true;
    return;
  }

  const okValidation = validateOkRequirements();
  if (!okValidation.ok) {
    itemError.value = okValidation.message;
    return;
  }

  if (isDemandeSpe(currentItem.value.item, 'asup')) {
    const lotsWithWarning = asupLots.value.filter((lot) => lot.statutAsup === 3);
    if (lotsWithWarning.length > 0) {
      const comment = lotsWithWarning
        .map((lot) => {
          const days = daysUntil(lot.datePeremption);
          return `Lot ${lot.numLot} (${lot.count} médicament${lot.count > 1 ? 's' : ''}), ${formatDaysUntil(days)} (retiré du sac)`;
        })
        .join(' | ');
      const updated = await updateCurrentItem('NOK', comment);
      if (updated) {
        await advanceItem();
      }
      return;
    }
  }

  const okComment = buildOkComment();
  const updated = await updateCurrentItem('OK', okComment);
  if (updated) {
    await advanceItem();
  }
};

const handleSwipeEnd = async () => {
  if (!swipeActive.value) {
    return;
  }
  swipeActive.value = false;
  const direction = swipeOffset.value >= SWIPE_TRIGGER_OFFSET
    ? 'OK'
    : swipeOffset.value <= -SWIPE_TRIGGER_OFFSET
      ? 'NOK'
      : '';
  swipeOffset.value = 0;
  swipeFromAsupControl.value = false;
  swipePointerId.value = null;
  swipeTouchId.value = null;
  if (direction) {
    await handleSwipe(direction);
  }
};

const isInteractiveTarget = (target) => {
  if (!target || typeof target.closest !== 'function') return false;
  return Boolean(target.closest('button, input, label, select, textarea, a, .no-swipe'));
};

const isAsupSwipeTarget = (target) => {
  if (!target || typeof target.closest !== 'function') return false;
  return Boolean(target.closest('.asup-checks, .asup-lot, .asup-check'));
};

const shouldBlockSwipeStart = (target) => {
  if (!isInteractiveTarget(target)) return false;
  if (isAsupRequest(currentItem.value?.item) && isAsupSwipeTarget(target)) {
    return false;
  }
  return true;
};

const onSwipeStart = (event) => {
  if (showIssueForm.value) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  if (shouldBlockSwipeStart(event.target)) return;
  swipeFromAsupControl.value = isAsupRequest(currentItem.value?.item) && isAsupSwipeTarget(event.target);
  swipeActive.value = true;
  swipeStartX.value = event.clientX;
  swipePointerId.value = event.pointerId;
  if (typeof event.currentTarget?.setPointerCapture === 'function') {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Ignorer silencieusement les navigateurs ne supportant pas le capture pointer.
    }
  }
};

const onSwipeMove = (event) => {
  if (!swipeActive.value) return;
  if (swipePointerId.value !== null && event.pointerId !== swipePointerId.value) return;
  const minOffset = swipeFromAsupControl.value ? 0 : -SWIPE_MAX_OFFSET;
  const deltaX = (event.clientX - swipeStartX.value) * SWIPE_SENSITIVITY;
  swipeOffset.value = Math.max(minOffset, Math.min(SWIPE_MAX_OFFSET, deltaX));
};

const onSwipeTouchStart = (event) => {
  if (!event.touches || !event.touches[0]) return;
  if (showIssueForm.value) return;
  if (shouldBlockSwipeStart(event.target)) return;
  const activeTouch = event.touches[0];
  swipeFromAsupControl.value = isAsupRequest(currentItem.value?.item) && isAsupSwipeTarget(event.target);
  swipeActive.value = true;
  swipeTouchId.value = activeTouch.identifier;
  swipeStartX.value = activeTouch.clientX;
};

const onSwipeTouchMove = (event) => {
  if (!swipeActive.value || !event.touches || !event.touches.length) return;
  const activeTouch = swipeTouchId.value === null
    ? event.touches[0]
    : Array.from(event.touches).find((touch) => touch.identifier === swipeTouchId.value);
  if (!activeTouch) return;
  const minOffset = swipeFromAsupControl.value ? 0 : -SWIPE_MAX_OFFSET;
  const deltaX = (activeTouch.clientX - swipeStartX.value) * SWIPE_SENSITIVITY;
  swipeOffset.value = Math.max(minOffset, Math.min(SWIPE_MAX_OFFSET, deltaX));
};

const validateOkRequirements = () => {
  const item = currentItem.value?.item;
  if (!item) return { ok: false, message: 'Aucun matériel sélectionné.' };
  if (isDemandeSpe(item, 'nivO2') && !o2Level.value) {
    return { ok: false, message: 'Veuillez indiquer le niveau O2.' };
  }
  if (isDemandeSpe(item, 'nivDSA') && dsaLevel.value <= 0) {
    return { ok: false, message: 'Veuillez indiquer le niveau de batterie DSA.' };
  }
  if (isDemandeSpe(item, 'asup')) {
    const lots = asupLots.value;
    if (!lots.length) {
      return { ok: false, message: 'Aucun lot ASUP récupéré.' };
    }
    const allChecked = lots.every((lot) => Boolean(asupChecks.value[lot.numLot]));
    if (!allChecked) {
      return { ok: false, message: 'Validez chaque lot ASUP.' };
    }
  }
  return { ok: true, message: '' };
};

const buildOkComment = () => {
  const item = currentItem.value?.item;
  if (!item) return '';
  const comments = [];
  if (isDemandeSpe(item, 'nivO2')) {
    comments.push(`Niveau O2 : ${o2Level.value}`);
  }
  if (isDemandeSpe(item, 'nivDSA')) {
    comments.push(`Niveau batterie DSA : ${dsaLevel.value}/5`);
  }
  if (isDemandeSpe(item, 'asup')) {
    const lotsChecked = asupLots.value
      .filter((lot) => asupChecks.value[lot.numLot])
      .map((lot) => lot.numLot);
    comments.push(`ASUP OK (lots: ${lotsChecked.join(', ')})`);
  }
  return comments.join(' | ');
};

const toggleIssueOption = (key) => {
  if (!Object.prototype.hasOwnProperty.call(issueSelections.value, key)) {
    return;
  }
  issueSelections.value[key] = !issueSelections.value[key];
  itemError.value = '';
};

const submitIssue = async () => {
  if (!currentItem.value) return;
  const selected = issueSelections.value;
  if (!selected.reserve && !selected.commande && !selected.peremption && !selected.defectueux) {
    itemError.value = 'Sélectionnez au moins un problème.';
    return;
  }
  if ((selected.reserve || selected.peremption) && !issueReserveCount.value) {
    itemError.value = 'Indiquez le nombre pris depuis la réserve.';
    return;
  }
  if (selected.defectueux && !issueComment.value.trim()) {
    itemError.value = 'Veuillez saisir un commentaire pour le matériel défectueux.';
    return;
  }

  const comments = [];
  if (selected.reserve) {
    comments.push(`Matériel manquant, ajout depuis la réserve : ${issueReserveCount.value}`);
  }
  if (selected.commande) {
    comments.push('Matériel manquant, à commander');
  }
  if (selected.peremption) {
    comments.push(`Date de péremption < 2 mois : ${issueReserveCount.value}`);
  }
  if (selected.defectueux) {
    comments.push(`Matériel défectueux : ${issueComment.value.trim()}`);
  }

  const updated = await updateCurrentItem('NOK', comments.join(' | '));
  if (updated) {
    showIssueForm.value = false;
    await advanceItem();
  }
};

const cancelIssue = () => {
  showIssueForm.value = false;
};

const goToPreviousItem = () => {
  if (!zoneItems.value.length) return;
  const prevIndex = getPreviousIndex(currentItemIndex.value - 1);
  if (prevIndex >= 0) {
    currentItemIndex.value = prevIndex;
    resetItemState();
  }
};

const editGlobalItem = (summary) => {
  if (!summary?.zoneKey) return;
  selectedZoneKey.value = summary.zoneKey;
  currentItemIndex.value = summary.index;
  resetItemState();
};

const editZoneItem = (index) => {
  currentItemIndex.value = index;
  resetItemState();
};

const formatDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR');
};

const formatTime = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const buildInventairePayload = () => {
  const inventaire = {};
  const zones = inventaireData.value?.zones || {};
  Object.values(zones).forEach((zone) => {
    if (zone.codeZone === 'ETAT_VEHICULE') return;
    const materiels = zone.materiels || [];
    materiels.forEach((item) => {
      const commentaireInventaire = String(item.commentaireInventaire || '').trim();
      const hasCommentaire = Boolean(commentaireInventaire);
      if (item.statutInventaire === 'NOK' || hasCommentaire) {
        const status = item.statutInventaire === 'NOK' ? 'NOK' : 'OK';
        inventaire[item.codeMateriel || item.nomMateriel] = {
          nomMateriel: item.nomMateriel || '',
          zone: zone.nomZone || zone.codeZone,
          commentaire: commentaireInventaire,
          CommentaireInventaire: commentaireInventaire,
          status,
          Status: status
        };
      }
    });
  });
  return inventaire;
};

const submitInventaire = async () => {
  if (!inventaireData.value) return;
  submitError.value = '';
  submitSuccessMessage.value = '';

  const confirmed = window.confirm('Confirmez-vous la validation finale de cet inventaire ?');
  if (!confirmed) return;

  submitLoading.value = true;

  try {
    const heureDebut = inventaireData.value.heureDebut || new Date().toISOString();
    const date = formatDate(heureDebut);
    const heureDebutFormatted = formatTime(heureDebut);
    const heureFinFormatted = formatTime(new Date());
    const chef = inventaireData.value.chefDeGarde || '';
    const vehicule = inventaireData.value.vehicule || '';
    const isLotPsVehicule = formatEnginAssetName(vehicule) === 'LOTPS';
    const inventaireurs = Array.isArray(inventaireData.value.inventaireurs)
      ? inventaireData.value.inventaireurs.filter((matricule) => matricule !== chef)
      : [];

    const payload = {
      Date: date,
      HeureDebut: heureDebutFormatted,
      HeureFin: heureFinFormatted,
      ChefDeGarde: chef,
      Inventaireur1: inventaireurs[0] || '',
      Inventaireur2: inventaireurs[1] || '',
      Inventaireur3: inventaireurs[2] || '',
      Vehicule: vehicule,
      Inventaire: buildInventairePayload(),
      Status: 'PENDING',
      Commentaire: inventaireCommentaire.value || '',
      CommentaireInventaire: inventaireCommentaire.value || ''
    };

    if (!isLotPsVehicule) {
      payload.EtatVehicule = inventaireData.value.zones?.etat_vehicule?.etatVehicule || {};
    }

    const response = await fetch('https://api.cms-collonges.fr/inventaireVehicule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la validation de l’inventaire.');
    }

    await set(dbRef(db, 'inventaire'), null);
    inventaireCommentaire.value = '';
    handleDeconnexion();
    submitSuccessMessage.value = 'L\'inventaire a bien été envoyé.';
  } catch (error) {
    console.error('Erreur validation inventaire:', error);
    submitError.value = error.message || 'Impossible de valider l’inventaire.';
  } finally {
    submitLoading.value = false;
  }
};

const updateCurrentItem = async (status, commentaireInventaire) => {
  const zone = selectedZone.value;
  const current = currentItem.value;
  if (!zone || !current) return false;
  try {
    await update(
      dbRef(db, `inventaire/zones/${zone.key}/materiels/${current.index}`),
      {
        statutInventaire: status,
        commentaireInventaire: commentaireInventaire || ''
      }
    );
    return true;
  } catch (error) {
    console.error('Erreur update item:', error);
    itemError.value = 'Impossible de sauvegarder le matériel.';
    return false;
  }
};

const advanceItem = async () => {
  if (!zoneItems.value.length) return;
  const nextIndex = getNextPendingIndex(currentItemIndex.value + 1);
  if (nextIndex >= zoneItems.value.length) {
    const infoInventateur = {
      matricule: connectedAgent.value?.matricule || connectedMatricule.value,
      grade: connectedAgent.value?.grade || '',
      nom: connectedAgent.value?.nom || '',
      prenom: connectedAgent.value?.prenom || ''
    };
    await update(dbRef(db, `inventaire/zones/${selectedZone.value.key}`), {
      status: 'DONE',
      infoInventateur
    });
    currentItemIndex.value = zoneItems.value.length;
    return;
  }
  currentItemIndex.value = nextIndex;
};

const buildZonesPayload = () => {
  const materiels = inventaireParVehicule.value[selectedVehicle.value] || [];
  const zones = {};
  const isLotPsVehicule = formatEnginAssetName(selectedVehicle.value) === 'LOTPS';

  materiels.forEach((materiel) => {
    const zoneCodeRaw = String(materiel.zoneMateriel || '').trim();
    const zoneCode = zoneCodeRaw || 'default';
    const zoneKey = buildZoneKey(zoneCode);
    if (!zones[zoneKey]) {
      zones[zoneKey] = {
        codeZone: zoneCode,
        nomZone: formatZoneName(zoneCode),
        inventaireur: null,
        infoInventateur: null,
        status: 'PENDING',
        materiels: []
      };
    }
    zones[zoneKey].materiels.push({
      codeMateriel: materiel.codeMateriel || '',
      nomMateriel: materiel.nomMateriel || '',
      qteMateriel: materiel.qteMateriel || '',
      zoneMateriel: materiel.zoneMateriel || '',
      isPeremption: materiel.isPeremption || '',
      noCheck: materiel.noCheck || '',
      commentaire: materiel.commentaire || '',
      demandeSpe: materiel.demandeSpe || '',
      statutInventaire: 'PENDING',
      commentaireInventaire: ''
    });
  });

  if (Object.keys(zones).length === 0) {
    zones.default = {
      codeZone: 'default',
      nomZone: 'Default',
      inventaireur: null,
      infoInventateur: null,
      status: 'PENDING',
      materiels: []
    };
  }

  if (!isLotPsVehicule) {
    zones.etat_vehicule = {
      codeZone: 'ETAT_VEHICULE',
      nomZone: 'Etat du véhicule',
      inventaireur: null,
      infoInventateur: null,
      status: 'PENDING',
      materiels: [],
      etatVehicule: defaultEtatVehicule()
    };
  }

  return zones;
};

const launchInventaire = async () => {
  if (!canLaunch.value) {
    selectionError.value = 'Sélectionnez 4 agents et un engin avant de lancer.';
    return;
  }

  selectionError.value = '';
  submitSuccessMessage.value = '';

  try {
    const inventaireRef = dbRef(db, 'inventaire');
    const existing = await get(inventaireRef);
    if (existing.exists()) {
      selectionError.value = 'Un inventaire est déjà en cours.';
      return;
    }

    const payload = {
      vehicule: selectedVehicle.value,
      heureDebut: new Date().toISOString(),
      chefDeGarde: chefDeGarde.value?.matricule || null,
      inventaireurs: selectedAgents.value.map((agent) => agent.matricule),
      inventaireursDetails: selectedAgents.value.map((agent) => ({
        matricule: agent.matricule,
        grade: agent.grade,
        nom: agent.nom,
        prenom: agent.prenom
      })),
      zones: buildZonesPayload()
    };

    if (formatEnginAssetName(selectedVehicle.value) !== 'LOTPS') {
      payload.etatVehicule = defaultEtatVehicule();
    }

    await set(inventaireRef, payload);
    console.log('Lancement inventaire:', payload);
  } catch (error) {
    console.error('Erreur lancement inventaire:', error);
    selectionError.value = 'Impossible de créer l\'inventaire.';
  }
};
</script>

<style scoped>
.inventaire-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem 1.5rem 3rem;
}

.inventaire-header h1 {
  margin: 0 0 0.5rem;
  font-size: 2.2rem;
  color: #1a1a1a;
}

.inventaire-subtitle {
  margin: 0;
  color: #5f6b7a;
  font-size: 1.05rem;
}

.inventaire-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 6px 20px rgba(17, 24, 39, 0.06);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #1f2937;
}

.selection-count {
  font-weight: 600;
  color: #2563eb;
}

.inventaire-info {
  display: grid;
  gap: 0.5rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
}

.info-item {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  color: #1f2937;
}

.info-label {
  font-weight: 600;
  color: #374151;
}

.info-value {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.pill {
  background: #e5e7eb;
  color: #111827;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.85rem;
}

.connexion-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.connexion-input {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.text-input {
  flex: 1 1 220px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 0.65rem 0.85rem;
  font-size: 1rem;
  line-height: 1.2;
  height: 42px;
}

.compact-number-input {
  flex: 0 0 150px;
  max-width: 170px;
  height: 36px;
  padding: 0.45rem 0.65rem;
}
.zone-top-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-start;
}

.success-message {
  background: #ecfdf3;
  color: #15803d;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-weight: 600;
}

.disconnect-row {
  display: flex;
  justify-content: flex-end;
}

.disconnect-button {
  background: #fee2e2;
  color: #991b1b;
  border: none;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
}

.disconnect-button:hover {
  background: #fecaca;
}

.status-legend {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
}

.status-legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #334155;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.selection-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 12px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.summary-label {
  font-size: 0.85rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary-value {
  font-weight: 600;
  color: #111827;
}

.agents-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.agent-group {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.75rem 0.75rem 1rem;
  background: #f9fafb;
}

.agent-group.empty {
  background: #f3f4f6;
  border-color: #e5e7eb;
}

.agent-group-title {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-start;
  flex-wrap: wrap;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
  background: transparent;
  border: none;
  padding: 0.25rem 0.25rem;
  cursor: pointer;
}

.agent-group-title:disabled {
  cursor: not-allowed;
  color: #9ca3af;
}

.group-label {
  flex: 1 1 auto;
  min-width: 0;
  overflow-wrap: anywhere;
}

.toggle-indicator {
  margin-left: auto;
  font-size: 0.85rem;
  font-weight: 600;
  color: #2563eb;
}

.toggle-indicator.muted {
  color: #9ca3af;
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.9rem;
}

.agent-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.85rem;
  text-align: left;
  cursor: pointer;
  transition: border 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.agent-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.12);
  transform: translateY(-1px);
}

.agent-card.selected {
  border-color: #2563eb;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.2);
}

.agent-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.agent-grade-icon {
  width: 28px;
  height: auto;
  border-radius: 6px;
  object-fit: cover;
}

.agent-name {
  font-weight: 600;
  color: #111827;
}

.agent-matricule {
  display: flex;
  align-items: center;
}

.matricule-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #eef2ff;
  color: #3730a3;
  border-radius: 999px;
  padding: 0.2rem 0.65rem;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.zones-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.zones-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.85rem;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.zones-progress-header {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  color: #1f2937;
  font-weight: 600;
  font-size: 0.9rem;
}

.zones-progress-fill {
  background: linear-gradient(90deg, #2563eb 0%, #16a34a 100%);
}

.zones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.75rem;
}

.zone-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  text-align: left;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.zone-card:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.12);
}

.zone-card:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.zone-card-main {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 0.75rem;
  align-items: center;
}

.zone-icon-box {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  overflow: hidden;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zone-illustration {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.zone-icon-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background: #d1d5db;
}

.zone-card-content {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.zone-title-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.zone-title-wrap {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
}

.zone-result-tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  background: #e5e7eb;
  color: #4b5563;
}

.zone-result-tag.is-okay {
  background: #dcfce7;
  color: #166534;
}

.zone-result-tag.is-problem {
  background: #fee2e2;
  color: #b91c1c;
}

.zone-result-tag.is-progress {
  background: #ffedd5;
  color: #9a3412;
}

.zone-result-tag.is-pending {
  background: #dbeafe;
  color: #1d4ed8;
}

.zone-title {
  font-weight: 700;
  color: #111827;
  overflow-wrap: anywhere;
  line-height: 1.2;
}

.zone-status {
  color: #374151;
  font-size: 0.95rem;
}

.zone-highlight {
  display: inline-block;
  background: #fef3c7;
  color: #92400e;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-weight: 600;
}

.zone-agent {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: 0.35rem;
}

.zone-grade-icon {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  object-fit: cover;
}

.zone-locked {
  border-color: #f59e0b;
  background: #ffffff;
}

.zone-done {
  border-color: #10b981;
  background: #ffffff;
}

.zone-pending {
  border-color: #d1d5db;
}

.etat-vehicule-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.zone-detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 6px 20px rgba(17, 24, 39, 0.06);
}

.return-button {
  background: #e5e7eb;
  color: #111827;
  border: none;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-track {
  flex: 1 1 auto;
  background: #e5e7eb;
  border-radius: 999px;
  height: 10px;
  overflow: hidden;
}

.progress-fill {
  background: #2563eb;
  height: 100%;
  width: 0%;
  transition: width 0.2s ease;
}

.progress-label {
  font-weight: 600;
  color: #1f2937;
  min-width: 50px;
  text-align: right;
}

.zone-items {
  display: grid;
  gap: 0.6rem;
}

.item-screen {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 4rem;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.item-chip {
  align-self: flex-start;
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.85rem;
}

.item-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #111827;
  overflow-wrap: anywhere;
  line-height: 1.2;
}

.item-meta {
  color: #374151;
  font-weight: 600;
}

.item-comment {
  color: #6b7280;
  font-style: italic;
}

.expiry-warning {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #c2410c;
  background: #ffedd5;
  padding: 0.4rem 0.7rem;
  border-radius: 10px;
  font-weight: 600;
}

.expiry-icon {
  width: 20px;
  height: 20px;
}

.special-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.special-title {
  font-weight: 700;
  color: #111827;
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  border: 1px solid #cbd5f5;
  background: #ffffff;
  color: #1e3a8a;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.chip.active {
  background: #1d4ed8;
  color: #ffffff;
  border-color: #1d4ed8;
}

.special-warning {
  color: #b91c1c;
  background: #fee2e2;
  padding: 0.5rem 0.7rem;
  border-radius: 10px;
  font-weight: 600;
}

.special-email {
  color: #1d4ed8;
  font-weight: 700;
}

.asup-checks {
  display: grid;
  gap: 0.5rem;
}

.asup-lot {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.5rem;
  border-radius: 10px;
  background: #f1f5f9;
}

.asup-check {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-weight: 600;
  color: #1f2937;
}

.asup-check img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.asup-check input {
  margin-top: 2px;
}

.asup-lot-lines {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.asup-lot-line {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.issue-form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.issue-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.55rem;
}

.issue-card {
  text-align: left;
  border: 1px solid #d1d5db;
  background: #ffffff;
  border-radius: 12px;
  padding: 0.7rem 0.75rem;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.issue-card:hover {
  border-color: #93c5fd;
}

.issue-card.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.issue-card-title {
  font-weight: 700;
  color: #111827;
}

.issue-card-description {
  color: #4b5563;
  font-size: 0.88rem;
}

.issue-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.issue-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.swipe-card-wrapper {
  position: relative;
  touch-action: pan-y;
  user-select: none;
}
.swipe-card {
  touch-action: pan-y;
}

.swipe-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 1.2rem;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.12);
  transition: transform 0.12s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.16s ease;
  position: relative;
  will-change: transform;
}

.swipe-card.dragging {
  transition: none;
}

.swipe-card.disabled {
  opacity: 0.7;
}

.swipe-card.tone-ok {
  background: #effaf4;
}

.swipe-card.tone-pb {
  background: #fef2f2;
}

.swipe-hint {
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 0.75rem;
}

.item-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.zone-item {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
  background: #f9fafb;
}

.zone-item-title {
  font-weight: 600;
  color: #111827;
}

.zone-item-subtitle {
  color: #6b7280;
  font-size: 0.9rem;
}

.zone-empty {
  color: #6b7280;
  font-size: 0.95rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.zone-close-button {
  align-self: center;
}

.zone-summary {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.global-summary {
  margin-top: 1.5rem;
}

.zone-summary-title {
  font-weight: 700;
  color: #111827;
}

.zone-summary-scroll {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem;
}

.zone-summary-scroll-header {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
  color: #1f2937;
  font-size: 0.9rem;
  font-weight: 600;
}

.zone-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}

.global-summary-grid {
  grid-template-columns: 1fr;
  max-height: 330px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.zone-summary-card {
  text-align: left;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.75rem;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.zone-summary-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.12);
}

.zone-summary-name {
  font-weight: 700;
  color: #111827;
}

.zone-summary-meta {
  color: #6b7280;
  font-size: 0.9rem;
}

.zone-summary-status {
  font-weight: 700;
  color: #16a34a;
}

.zone-summary-status.nok {
  color: #dc2626;
}

.zone-summary-status.ok {
  color: #16a34a;
}

.zone-summary-comment {
  color: #374151;
  font-size: 0.9rem;
}

.zone-final {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.text-area {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 0.65rem 0.85rem;
  font-size: 1rem;
  resize: vertical;
}

.zone-summary-hint {
  color: #6b7280;
  font-size: 0.9rem;
}

.etat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.85rem;
}

.etat-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1f2937;
  font-weight: 500;
}

.range-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.range-value {
  font-weight: 600;
  color: #111827;
}

.vehicle-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.vehicle-item {
  padding: 0.65rem 1.2rem;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  color: #1f2937;
}

.vehicle-item:hover {
  border-color: #93c5fd;
  color: #1d4ed8;
}

.vehicle-item.selected {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.vehicle-item:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  border-color: #e5e7eb;
  cursor: not-allowed;
}

.launch-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.launch-button {
  align-self: flex-start;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  border: none;
  background: #2563eb;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.launch-button:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.launch-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.agent-card:active,
.zone-card:active,
.vehicle-item:active,
.zone-summary-card:active,
.issue-card:active,
.launch-button:active,
.return-button:active,
.disconnect-button:active {
  transform: scale(0.98);
}

.launch-hint {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.loading-message,
.error-message {
  padding: 0.85rem 1rem;
  border-radius: 10px;
  font-weight: 600;
}

.loading-message {
  background: #f8fafc;
  color: #1f2937;
}

.error-message {
  background: #fef2f2;
  color: #b91c1c;
}

@media (max-width: 720px) {
  .inventaire-container {
    padding: 1rem 0.45rem 2rem;
    gap: 1.25rem;
  }

  .inventaire-section {
    padding: 0.95rem;
    gap: 1rem;
    border-radius: 12px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-header h2,
  .section-header h3 {
    margin: 0;
    font-size: 1.2rem;
    overflow-wrap: anywhere;
  }

  .selection-count {
    font-size: 0.95rem;
    overflow-wrap: anywhere;
  }

  .zones-grid,
  .agent-grid,
  .zone-summary-grid {
    grid-template-columns: 1fr;
  }

  .zone-card-main {
    grid-template-columns: 48px 1fr;
    gap: 0.6rem;
  }

  .zone-icon-box {
    width: 48px;
    height: 48px;
  }

  .zone-status {
    font-size: 0.88rem;
  }

  .item-title {
    font-size: 1.22rem;
  }

  .zone-detail {
    padding: 1rem;
  }

  .connexion-input {
    flex-direction: column;
  }

  .launch-button,
  .return-button,
  .disconnect-button {
    max-width: 100%;
    white-space: normal;
  }

  .compact-number-input {
    flex: 1 1 auto;
    max-width: 100%;
  }
}
</style>

