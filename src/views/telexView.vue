<template>
    <div class="subtitle">
        Simulation d'un ordre de départ
    </div>
    <div class="full" v-if="verifyIfPhone()">
        <useComputer></useComputer>
    </div>
    <div  v-else>
        <div class="consigne">
                    <span class="number" id="premiereConsigne">1</span>
                    J'indique les <span class="TextHighlight">informations de base</span> de l'intervention simulée.
                </div>
                <div class="consigne">
                    <span  class="number" id="deuxiemeConsigne">2</span>
                    Je sélectionne les <span class="TextHighlight">groupes fonctionnels (GFO)</span> que je souhaite.
                </div>
                <div class="consigne">
                    <span class="number" id="troisiemeConsigne">3</span>
                    Je sélectionne les <span class="TextHighlight">agents de la caserne</span> que j'intègre dans la manœuvre en réalisant une affectation manuelle ou (semi)automatique.
                </div>
                <div class="consigne">
                    <span class="number" id="quatriemeConsigne">4</span>
                    J'ajoute les <span class="TextHighlight">agents extérieurs</span> que j'intègre dans la manœuvre en réalisant une affectation manuelle.
                </div>
            <div class="asupButton" @click="showApp = true">
        <div><img src="@/assets/icons/asup.svg" width="50" height="auto" ></div>
        <div>Accéder à l'application</div>
    </div>
    </div>

    <div class="fullView" v-if="showApp" >
        <div class="return">
                <div class="returnBtn" @click="showApp = false">Fermer</div>
        </div>
        <div class="subtitle titleApp">
        Simulation d'un ordre de départ
        </div>
        <div class="logoApp">
            <img src="@/assets/logoTitle.png" width="200px" height="auto" >
        </div>
        <div id="mapid" v-if="step == 1 || step == 2">
            <iframe width="500" height="500" :src="mapSource" style="scale: 1.2;"></iframe><br/><small><a href="https://www.openstreetmap.org/?mlat=45.817419&amp;mlon=4.846610#map=19/45.817419/4.846610">Afficher une carte plus grande</a></small>
        </div>
        <div v-if="step == 1" id="appStep1">
            <div id="layoutMargin"></div>
            <div class="subtitle">
                Informations de base
            </div>
            <div class="subsubtitle">
                Date et heure de l'intervention
            </div>
            <div class="formElement">
                <Calendar id="datepicker-24h" v-model="timeDateInter" showTime showSeconds hourFormat="24" fluid :disabled="!manualHour"/>
                <div class="flex items-center gap-2">
                <Checkbox v-model="manualHour" inputId="ingredient1" name="dateModify" value="false" :disabled="manualHour" />
                    <label for="ingredient1"> Modifier la date </label>
                </div>
            </div>
            <div class="subsubtitle">
                    Lieu de l'intervention
            </div>
            <div class="formElement">
                <AutoComplete v-model="selectedAddress" :suggestions="searchedAddress" @complete="search" optionLabel="label" optionGroupLabel="label" optionGroupChildren="items" placeholder="Chercher l'adresse" :disabled="showAddress">
                    <template #optiongroup="slotProps">
                        <div class="flex align-items-center country-item">
                            <div>{{ slotProps.option.label }}</div>
                        </div>
                    </template>
                </AutoComplete>
                <button @click="getMoreAddress" class="arrow-button" :class="isLoading" v-if="!showAddress && typeof(selectedAddress) == 'object'">
                    <span v-if="!loading">→</span><span v-else><img src="@/assets/loading2.gif" alt="" width="20px" height="auto"></span>
                </button>
            </div>
            <div v-if="showAddress">
                <label for="Voie" class="labelForm">Voie</label>
                <InputText v-model="addressVoie" inputId="Voie" placeholder="Voie de l'adresse" />
            </div>
            <div v-if="showAddress">
                <label for="Commune" class="labelForm">Commune</label>
                <InputText v-model="addressCommune" inputId="Commune" placeholder="Commune" />
            </div>
            <div v-if="showAddress" class="flexx">
                <div>
                    <label for="Livre" class="labelForm">Livre</label><br>
                    <Dropdown v-model="addressLivre" :options="livres" placeholder="Livre" class="w-full md:w-14rem" />
                </div>
                <div id="coordonnees">
                    <label for="coordonnees" class="labelForm">Coordonnées</label>
                    <InputText v-model="coordonnees" inputId="coordonnees" placeholder="Coordonnées Livre" />
                </div>
            </div>
            <div v-if="showAddress">
                <label for="erp" class="labelForm">ERP</label><br>
                <Dropdown v-model="erp" :options="erpList" placeholder="Sélectionner un ERP" fluid class="w-full md:w-14rem" />
            </div>
            <div v-if="showAddress" class="flexx">
                <div>
                    <label for="Etage" class="labelForm">Etage</label><br>
                    <Dropdown v-model="addressEtage" :options="etages" placeholder="Etage" class="w-full md:w-14rem" />
                </div>
                <div id="Batiment">
                    <label for="Batiment" class="labelForm">Bâtiment</label>
                    <InputText v-model="addressBatiment" inputId="Batiment" placeholder="Bâtiment" class="w-5rem md:w-5rem" />
                </div>
            </div>  
            <div v-if="showAddress" class="subsubtitle">
                PRV, PRI, PRM
            </div>
            <div v-if="showAddress" id="prvField">
                <div class="flex items-center gap-2">
                <Checkbox v-model="prvCondition" inputId="prv" name="dateModify" value="false" :disabled="prvCondition" />
                    <label for="prv">Ajouter un PRV </label>
                </div>
                <div class="formElement" v-if="prvCondition">
                <AutoComplete v-model="selectedAddressPRV" :suggestions="searchedAddressPRV" @complete="search" optionLabel="label" optionGroupLabel="label" optionGroupChildren="items" placeholder="Chercher l'adresse" :disabled="showAddress3">
                    <template #optiongroup="slotProps">
                        <div class="flex align-items-center country-item">
                            <div>{{ slotProps.option.label }}</div>
                        </div>
                    </template>
                </AutoComplete>
                <button @click="getMoreAddress3" class="arrow-button" :class="isLoading" v-if="!showAddress3 && typeof(selectedAddressPRV) == 'object'">
                    <span v-if="!loading">→</span><span v-else><img src="@/assets/loading2.gif" alt="" width="20px" height="auto"></span>
                </button>
                </div>
                <div v-if="showAddress3">
                <label for="Voie" class="labelForm">Voie</label>
                <InputText v-model="addressVoiePRV" inputId="Voie" placeholder="Voie de l'adresse" />
            </div>
            <div v-if="showAddress3">
                <label for="Commune" class="labelForm">Commune</label>
                <InputText v-model="addressCommunePRV" inputId="Commune" placeholder="Commune" />
            </div>
            <div v-if="showAddress3" class="flexx">
                <div>
                    <label for="Livre" class="labelForm">Livre</label><br>
                    <Dropdown v-model="addressLivrePRV" :options="livres" placeholder="Livre" class="w-full md:w-14rem" />
                </div>
                <div id="coordonnees">
                    <label for="coordonnees" class="labelForm">Coordonnées</label>
                    <InputText v-model="coordonneesPRV" inputId="coordonnees" placeholder="Coordonnées Livre" />
                </div>
            </div>
            <div v-if="showAddress3">
                <label for="erp" class="labelForm">ERP</label><br>
                <Dropdown v-model="erpPRV" :options="erpList" placeholder="Sélectionner un ERP" fluid class="w-full md:w-14rem" />
            </div>
            <div v-if="showAddress3" class="flexx">
                <div>
                    <label for="Etage" class="labelForm">Etage</label><br>
                    <Dropdown v-model="addressEtagePRV" :options="etages" placeholder="Etage" class="w-full md:w-14rem" />
                </div>
                <div id="Batiment">
                    <label for="Batiment" class="labelForm">Bâtiment</label>
                    <InputText v-model="addressBatimentPRV" inputId="Batiment" placeholder="Bâtiment" class="w-5rem md:w-5rem" />
                </div>
            </div>
            </div>
            <div v-if="showAddress" id="priField">
                <div class="flex items-center gap-2">
                <Checkbox v-model="priCondition" inputId="pri" name="dateModify" value="false" :disabled="priCondition" />
                    <label for="pri">Ajouter un PRI </label>
                </div>
                <div class="formElement" v-if="priCondition">
                <AutoComplete v-model="selectedAddressPRI" :suggestions="searchedAddressPRI" @complete="search" optionLabel="label" optionGroupLabel="label" optionGroupChildren="items" placeholder="Chercher l'adresse" :disabled="showAddress4">
                    <template #optiongroup="slotProps">
                        <div class="flex align-items-center country-item">
                            <div>{{ slotProps.option.label }}</div>
                        </div>
                    </template>
                </AutoComplete>
                <button @click="getMoreAddress4" class="arrow-button" :class="isLoading" v-if="!showAddress4 && typeof(selectedAddressPRI) == 'object'">
                    <span v-if="!loading">→</span><span v-else><img src="@/assets/loading2.gif" alt="" width="20px" height="auto"></span>
                </button>
                </div>
                <div v-if="showAddress4">
                <label for="Voie" class="labelForm">Voie</label>
                <InputText v-model="addressVoiePRI" inputId="Voie" placeholder="Voie de l'adresse" />
            </div>
            <div v-if="showAddress4">
                <label for="Commune" class="labelForm">Commune</label>
                <InputText v-model="addressCommunePRI" inputId="Commune" placeholder="Commune" />
            </div>
            <div v-if="showAddress4" class="flexx">
                <div>
                    <label for="Livre" class="labelForm">Livre</label><br>
                    <Dropdown v-model="addressLivrePRI" :options="livres" placeholder="Livre" class="w-full md:w-14rem" />
                </div>
                <div id="coordonnees">
                    <label for="coordonnees" class="labelForm">Coordonnées</label>
                    <InputText v-model="coordonneesPRI" inputId="coordonnees" placeholder="Coordonnées Livre" />
                </div>
            </div>
            <div v-if="showAddress4">
                <label for="erp" class="labelForm">ERP</label><br>
                <Dropdown v-model="erpPRI" :options="erpList" placeholder="Sélectionner un ERP" fluid class="w-full md:w-14rem" />
            </div>
            <div v-if="showAddress4" class="flexx">
                <div>
                    <label for="Etage" class="labelForm">Etage</label><br>
                    <Dropdown v-model="addressEtagePRI" :options="etages" placeholder="Etage" class="w-full md:w-14rem" />
                </div>
                <div id="Batiment">
                    <label for="Batiment" class="labelForm">Bâtiment</label>
                    <InputText v-model="addressBatimentPRI" inputId="Batiment" placeholder="Bâtiment" class="w-5rem md:w-5rem" />
                </div>
            </div>
            </div>
            <div v-if="showAddress" id="prmField">
                <div class="flex items-center gap-2">
                <Checkbox v-model="prmCondition" inputId="prm" name="dateModify" value="false" :disabled="prmCondition" />
                    <label for="prm">Ajouter un PRM </label>
                </div>
                <div class="formElement" v-if="prmCondition">
                <AutoComplete v-model="selectedAddressPRM" :suggestions="searchedAddressPRM" @complete="search" optionLabel="label" optionGroupLabel="label" optionGroupChildren="items" placeholder="Chercher l'adresse" :disabled="showAddress2">
                    <template #optiongroup="slotProps">
                        <div class="flex align-items-center country-item">
                            <div>{{ slotProps.option.label }}</div>
                        </div>
                    </template>
                </AutoComplete>
                <button @click="getMoreAddress2" class="arrow-button" :class="isLoading" v-if="!showAddress2 && typeof(selectedAddressPRM) == 'object'">
                    <span v-if="!loading">→</span><span v-else><img src="@/assets/loading2.gif" alt="" width="20px" height="auto"></span>
                </button>
                </div>
                <div v-if="showAddress2">
                <label for="Voie" class="labelForm">Voie</label>
                <InputText v-model="addressVoiePRM" inputId="Voie" placeholder="Voie de l'adresse" />
            </div>
            <div v-if="showAddress2">
                <label for="Commune" class="labelForm">Commune</label>
                <InputText v-model="addressCommunePRM" inputId="Commune" placeholder="Commune" />
            </div>
            <div v-if="showAddress2" class="flexx">
                <div>
                    <label for="Livre" class="labelForm">Livre</label><br>
                    <Dropdown v-model="addressLivrePRM" :options="livres" placeholder="Livre" class="w-full md:w-14rem" />
                </div>
                <div id="coordonnees">
                    <label for="coordonnees" class="labelForm">Coordonnées</label>
                    <InputText v-model="coordonneesPRM" inputId="coordonnees" placeholder="Coordonnées Livre" />
                </div>
            </div>
            <div v-if="showAddress2">
                <label for="erp" class="labelForm">ERP</label><br>
                <Dropdown v-model="erpPRM" :options="erpList" placeholder="Sélectionner un ERP" fluid class="w-full md:w-14rem" />
            </div>
            <div v-if="showAddress2" class="flexx">
                <div>
                    <label for="Etage" class="labelForm">Etage</label><br>
                    <Dropdown v-model="addressEtagePRM" :options="etages" placeholder="Etage" class="w-full md:w-14rem" />
                </div>
                <div id="Batiment">
                    <label for="Batiment" class="labelForm">Bâtiment</label>
                    <InputText v-model="addressBatimentPRM" inputId="Batiment" placeholder="Bâtiment" class="w-5rem md:w-5rem" />
                </div>
            </div>
            <p>REMARQUE : Vous aurez la possibilité d'affecter certains <br>ou tous les engins à des PRM, PRV ou PRI plus tard.</p>
            </div>
            <div v-if="showAddress && typeof(selectedAddress) == 'object'">
                <div class="subsubtitle">
                        Sélection de la raison de l'intervention
                </div>
                <div class="formElement">
                    <Dropdown v-model="selectedSinistre" :options="sinistres" @change="getSinistreGFO" optionLabel="labelComplet" filter optionGroupLabel="label" optionGroupChildren="items" placeholder="Sélectionner un sinistre" class="w-full md:w-14rem">
                        <template #optiongroup="slotProps">
                        <div class="flex align-items-center">
                            <div>{{ slotProps.option.labelComplet }}</div>
                        </div>
                        </template>
                    </Dropdown>
                </div>
                <div v-if="typeof(selectedSinistre) == 'object' && gfos" class="gfoList">
                    <div>
                        <b>GFO</b>
                    </div>
                    <div>
                        <Chips v-model="gfos" />
                    </div>
                    <div class="gfoList"><Dropdown v-model="toAddGfo" :options="maxConfigCollonges" @change="addGfo" placeholder="Ajouter un GFO pour Collonges" class="w-full md:w-14rem" /></div>
                </div>
            </div>
            <div v-if="step2Possible" class="validationBtn" @click="step = 2">Passer à l'étape suivante</div>
            <div id="layoutMargin"></div>
        </div>
        <div v-if="step == 2" style="overflow: auto; padding-right: 30%; transform: translateX(30%);">
            <div id="layoutMargin"></div>
            <div>
                <div>
                    <div class="subsubtitle">
                        Intervention
                    </div>
                </div>
                <div class="leftMargin">
                    <b>{{selectedSinistre.label}} à {{ addressCommune }}</b>
                </div>
            </div>
            <div class="subsubtitle">
                    GFO
            </div>
                <div class="leftMargin">
                    {{ gfos.join(', ') }}
                </div>
            <br>
            <div class="subtitle">
                Sélection des agents de la caserne
            </div>
            <div>
                <Listbox v-model="selectedAgents" multiple :options="agents" filter striped  optionLabel="label" class="gfoList" 
                :virtualScrollerOptions="{ itemSize: 38 }" listStyle="height:250px" />
                <button @click="selectedAgents = agents">Ajouter tous</button>
                <button @click="selectedAgents = []">Supprimer tous</button>
            </div>
            <div class="marginTop">
                <p v-if="manuallyAddedAgent != '' && !isAnAgent">😕 Le matricule {{ manuallyAddedAgent }} n'est pas reconnu</p> <p v-if="manuallyAddedAgent != '' && isAnAgent">👌 Appuyez sur la touche Entrer pour ajouter ce matricule.</p>
                <InputText v-model="manuallyAddedAgent" placeholder="Ajouter un agent par son matricule" @keydown.enter="addManually" :invalid="manuallyAddedAgent != '' && !isAnAgent" />
            </div>
            <p v-if="selectedAgents.length != 0" class="greyText">
                Vous avez sélectionné {{selectedAgents.length}} agent{{selectedAgents.length == 1 ? "": "s"}}.
            </p>
            <div v-if="selectedAgents.length >= 2" class="validationBtn" @click="step3function">Passer à l'étape suivante</div>
            <div id="layoutMargin"></div>
        </div>
        <div class="returnButton" v-if="step == 2" @click="step = 1">Retour</div>
        <div v-if="step == 3">
            <div id="layoutMargin"></div>
            <div class="subtitle">
                Affectation des agents de la caserne
            </div>
            <div class="blurBck" v-if="showPopup" @click="showPopup = !showPopup"></div>
            <div class="popupAffectation" v-if="showPopup">
                <div class="subtitle">
                    Affectation manuelle
                </div>
                <div class="subsubtitle">
                    Agent
                </div>
                <div class="leftMargin">
                    {{popupTitle}}
                </div>
                <div class="subsubtitle">
                    GFO
                </div>
                <Dropdown v-model="popupGFO" :options="gfos" placeholder="Sélectionner un GFO" editable @change="loadRoles()" class="w-full md:w-14rem" />
                <div class="subsubtitle">
                    Engin
                </div>
                <Dropdown v-model="popupEngin" :options="enginsGfo" placeholder="Sélectionner un engin" class="w-full md:w-14rem" />
                <div class="subsubtitle">
                    Rôle
                </div>
                <Dropdown v-model="popupRole" :options="availableRoles" placeholder="Sélectionner un rôle" editable class="w-full md:w-14rem" />
                <div class="validationBtn" @click="affectAgent">Affecter</div>
            </div>
            <div class="twoColumns">
                <div class="firstColumn">
                    <div class="validationBtn" @click="automaticAffectation()"><span v-if="!loading">🪄 Affecter automatiquement</span><span v-else><img src="@/assets/loading2.gif" alt="" width="20px" height="auto"></span></div>
                    <div class="subsubtitle noBorder">
                        Agents de la caserne sur la manœuvre
                    </div>
                    <div v-for="agent in toAffectAgents" :key="agent.matricule">
                        <div class="agent" :class="isBeingDragged ? 'opacityFifty' : ''" v-on:dragover.prevent draggable="true" v-on:dragstart="dragStart($event, agent)">
                            <div class="agentMatricule">{{agent.matricule}}</div>
                            <div class="agentName">{{ agent.label.replace(`${agent.matricule} - `, '')}}</div>
                            <div v-if="agent.engin != ''" class="agentGFO greenText">{{ agent.engin }} ({{ agent.emploi }}) <span class="redCross" @click="removeAffectation(agent)">X</span></div>
                            <div v-else class="affectAgentLink" @click="affectAgentManually(agent)">Affecter manuellement</div>
                        </div>
                    </div>
                </div>
                <div class="secondColumn">
                    <div v-for="vehicule of enginsAffected" :key="vehicule.engin">
                        <div class="vehicule" :class="isBeingDragged ? 'blueShadow':''" v-on:dragover.prevent @drop="drop($event, vehicule)" @dragover.prevent>
                            <div class="vehiculeName">
                                <img :src="getIconSrc(vehicule.engin)" height="40px" width="auto">
                                <span class="vehiculeNameSpan">{{vehicule.engin}}</span>
                            </div>
                            <div class="affectation">
                                <div v-if="vehicule.affectation.length > 0">
                                    <div v-for="agent in vehicule.affectation" :key="agent.matricule">
                                        <div class="agent flexed">
                                            <div class="roleAgent">{{ agent.emploi.split("_")[1].toUpperCase() }}</div>
                                            <div class="part2">                                        
                                                <div class="agentMatricule">{{agent.matricule}}</div>
                                                <div class="agentName">{{ agent.label.replace(`${agent.matricule} - `, '')}}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else>
                                    <div class="noAgent">Aucun agent affecté</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div id="returnBtnStep2" @click="step = 2">Retour</div>
            <div class="validationBtn" id="validationBtn3" @click="step = 4" v-if="twentyPercentAffected">Passer à l'étape suivante</div>
            <div id="layoutMargin"></div>
        </div>
        <div v-if="step == 4">
            <div id="layoutMargin"></div>
            <div class="subtitle">
                Affectation des agents extérieurs
            </div> 
            <div class="blurBck" v-if="popupEnginExtCond || popupAgentExtCond"></div>
            <div class="popupAffectation" v-if="popupEnginExtCond">
                <div class="subtitle">
                    Ajout d'un véhicule
                </div>
                <div class="subsubtitle">
                    Véhicule
                </div>
                <div class="leftMargin">
                    <Dropdown v-model="popupEnginExt" :options="enginsListAll" filter optionLabel="label" placeholder="Sélectionner un véhicule" class="w-full md:w-14rem" />
                </div>
                <div class="subsubtitle">
                    Numéro de l'engin
                </div>
                <div class="leftMargin secondItem">
                    <InputText v-model="popupEnginNum" placeholder="Numéro de l'engin" />
                </div>
                <div class="subsubtitle">
                    Caserne
                </div>
                <div class="leftMargin">
                    <Dropdown v-model="popupCaserneExt" :options="caserneList" optionLabel="name" filter placeholder="Sélectionner une caserne" class="w-full md:w-14rem" />
                </div>
                <div v-if="typeof(popupEnginExt) == 'object' && popupEnginNum != '' && typeof(popupCaserneExt) == 'object'" class="validationBtn" @click="addCaserneEngin">Ajouter</div>
            </div>
            <div class="popupAffectation autoOverflow" v-if="popupAgentExtCond">
                <div class="subtitle">
                    Ajout d'un agent
                </div>
                <div class="subsubtitle">
                    Grade
                </div>
                <div class="leftMargin secondItem">
                    <Dropdown v-model="gradePopupAgent" :options="grades" placeholder="Sélectionner un grade" class="w-full md:w-14rem" />
                </div>
                <div class="subsubtitle">
                    Nom de famille
                </div>
                <div class="leftMargin">
                    <InputText v-model="nomPopupAgent" placeholder="Nom de famille" />
                </div>
                <div class="subsubtitle">
                    Prénom
                </div>
                <div class="leftMargin">
                    <InputText v-model="prenomPopupAgent" placeholder="Prénom" />
                </div>
                <div class="subsubtitle">
                    GFO
                </div>
                <div class="leftMargin secondItem">
                    <InputText v-model="gfoPopupAgent" placeholder="Indiquer un GFO" />
                </div>
                <div class="subsubtitle">
                    Rôle
                </div>
                <div class="leftMargin">
                    <InputText v-model="rolePopupAgent" placeholder="Indiquer un rôle" />
                </div>
                <div class="subsubtitle">
                    Véhicule
                </div>
                <div class="leftMargin">
                    <CascadeSelect v-model="affectationPopupAgent" :options="groupedByCaserneEngins" optionLabel="name" optionGroupLabel="caserne" :optionGroupChildren="['vehicules']" placeholder="Sélectionner un véhicule" class="w-full md:w-14rem" />
                </div>
                <div class="validationBtn" v-if="gradePopupAgent && nomPopupAgent && prenomPopupAgent && gfoPopupAgent && rolePopupAgent && affectationPopupAgent" @click="addAgentPopup">Ajouter {{ gradePopupAgent }} {{ nomPopupAgent.toUpperCase() }}</div>
            </div>
            <div class="twoColumns">
                <div class="firstColumn">
                    <div class="validationBtn" @click="startAddEngin"><span v-if="!loading">Ajouter un engin</span><span v-else><img src="@/assets/loading2.gif" alt="" width="20px" height="auto"></span></div>
                    <div class="validationBtn" @click="startAddAgent"><span v-if="!loading">Ajouter un agent</span><span v-else><img src="@/assets/loading2.gif" alt="" width="20px" height="auto"></span></div>
                    <div class="subsubtitle noBorder">
                        Agents extérieurs sur la manœuvre
                    </div>
                    <div v-if="toAffectAgentsExt.length == 0">
                        <div class="noAgent">Aucun agent extérieur ajouté.</div>
                    </div>
                    <div v-for="agent in toAffectAgentsExt" :key="agent.matricule">
                        <div class="agent">
                            <div class="agentMatricule">{{agent.matricule}}</div>
                            <div class="agentName">{{ agent.label.replace(`${agent.matricule} - `, '')}}</div>
                            <div v-if="agent.engin != ''" class="agentGFO greenText">{{ agent.engin }} ({{ agent.emploi }}) <span class="redCross" @click="removeAffectationExt(agent)">X</span></div>
                            <div v-else class="affectAgentLink" @click="affectAgentManuallyExt(agent)">Affecter manuellement</div>
                        </div>
                    </div>
                </div>
                <div class="secondColumn">
                    <div v-if="enginsAffectedExt.length == 0">
                        <div class="noAgent">Aucun véhicule extérieur ajouté.</div>
                    </div>
                    <div v-else v-for="vehicule of enginsAffectedExt" :key="vehicule.engin">
                        <div class="vehicule">
                            <div class="vehiculeName">
                                <span class="vehiculeNameSpan">{{vehicule.engin}}</span>
                                <span class="vehiculeCaserneSpan">{{ vehicule.caserne }}</span>
                            </div>
                            <div class="affectation">
                                <div v-if="vehicule.affectation.length > 0">
                                    <div v-for="agent in vehicule.affectation" :key="agent.matricule">
                                        <div class="agent flexed">
                                            <div class="roleAgent">{{ agent.emploi.split("_")[1].toUpperCase() }}</div>
                                            <div class="part2">                                        
                                                <div class="agentMatricule">{{agent.matricule}}</div>
                                                <div class="agentName">{{ agent.label.replace(`${agent.matricule} - `, '')}}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else>
                                    <div class="noAgent">Aucun agent affecté</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="returnBtnStep2" @click="step = 3">Retour</div>
            <div class="validationBtn" id="validationBtn3" @click="prepareStep5()">Passer à l'étape suivante</div>
            <div id="layoutMargin"></div>
        </div>
        <div v-if="step == 5" class="autoOverflow step5">
            <div id="layoutMargin"></div>
            <div class="middle">
            <div>
            <div class="subtitle">
                Observation
            </div>
            <p class="greyText">
                Cette observation générale sera présente pour tous les engins.
            </p>
            <div>
                <Textarea v-model="observationGenerale" autoResize rows="8" cols="50" :placeholder="placeholderObs" />
            </div>
            </div>
            <div>
            <div class="subtitle">
                Consigne
            </div>
            <p class="greyText">
                Cette consigne générale sera présente pour tous les engins.
            </p>
            <div>
                <Textarea v-model="consigneGenerale" autoResize rows="4" cols="50" placeholder="Exemple: EPI SUAP Niv. 2" />
            </div>
            </div>
            <div class="autoOverflow2">
                <div class="subtitle">
                    Récapitulatif rapide
                </div>
                <div class="subsubtitle">
                    Heure du premier départ
                </div>
                <div class="leftMargin">
                    {{ timeDateInter.toLocaleString() }}
                </div>
                <div class="subsubtitle">
                    Sinistre
                </div>
                <div class="leftMargin">
                    {{ selectedSinistre.label }}
                </div>
                <div class="subsubtitle">
                    Localisation
                </div>
                <div class="leftMargin">
                    {{ addressVoie }} <br>à {{ addressCommune }}
                </div>
                <div class="subsubtitle">
                    Engins et ordres de départs
                </div>
                <div class="leftMargin">
                    {{ enginsAffectedWithPeople.length }} engin{{ enginsAffectedWithPeople.length > 1 ? 's' : '' }} réparti{{ enginsAffectedWithPeople.length > 1 ? 's' : '' }} <br>sur {{ enginsAvecOrdreDepart.length }} ordre{{ enginsAvecOrdreDepart.length > 1 ? 's' : '' }} de départ
                </div>
            </div>
            </div>
            <div class="subtitle">
                Ordres de départs et personnalisation
            </div>
            <div class=" twoColumns2">
            <div class="colonne1">
            <div>
                <div class="validationBtn" style="width:5rem" @click="addODCond = true">Ajouter un ordre de départ</div>
                <div class="vehicule" v-if="addODCond">
                    <div class="greyBackground">
                        <div class="subsubtitle">Ordre de départ n°{{ enginsAvecOrdreDepart.length + 1 }}</div>
                        <div class="subsubtitle">Engins à affecter</div>
                        <div>
                            <MultiSelect v-model="enginsToAddOD" :options="enginsAffectedWithPeople" optionLabel="engin" filter placeholder="Sélectionner des engins" class="gfoList" />
                        </div>
                        <div class="subsubtitle">Temps écoulé</div>
                        <p class="greyText">Indiquez le temps (en minutes) qui s'est écoulé entre l'ordre de départ précédent et celui-là.</p>
                        <InputText v-model="tempsEcoule" placeholder="Temps écoulé en minutes" />
                        <div class="validationBtn" v-if="enginsToAddOD.length > 0 && tempsEcoule != ''" @click="addOD">Ajouter</div>
                    </div>
                </div>
                <p class="greyText">Appuyez sur un engin pour en personnaliser les caractéristiques (observation personnalisée, affectation PRV, etc.)</p>
                <div v-for="OD of enginsAvecOrdreDepart" :key="OD.ordreDepart">
                    <div class="subsubtitle">
                       Ordre départ n°{{OD.ordreDepart}}
                    </div>
                    <div class="ODEnginsFlex">
                        <div v-for="engin of OD.engins" :key="engin.engin">
                            <div class="vehicule vehiculeBtn" :class="isBeingPersonnalised(engin)" @click="ouvrirCaracteristiques(engin)">
                                <div class="vehiculeName">
                                    <span class="vehiculeNameSpan">{{engin.engin}}</span>
                                    <span class="vehiculeCaserneSpan">{{ engin.caserne }}</span>
                                    <span class="vehiculegfo">{{ engin.gfo }}</span>
                                </div>
                                <div class="affectation">
                                    <div v-if="engin.affectation.length > 0" class="flexxx">
                                        <div>
                                            <img class="imgClass opacityNinty" src="@/assets/icons/observation/firefighter.png" height="25px" width="auto">
                                            <span class="floattingBubble">{{ engin.affectation.length }}</span>
                                        </div>
                                        <div :class="isAddressPersonnalisedClass(engin)">
                                            <img class="imgClass" src="@/assets/icons/observation/adresse.png" height="25px" width="auto">
                                            <span class="floattingBubble" v-if="isAddressPersonnalised(engin) != ''">{{ isAddressPersonnalised(engin) }}</span>
                                        </div>
                                        <div :class="isRemorquePersonnalisedClass(engin)">
                                            <img class="imgClass" src="@/assets/icons/observation/trailer.png" height="25px" width="auto">
                                            <span class="floattingBubble" v-if="isRemorquePersonnalised(engin) != ''">{{ isRemorquePersonnalised(engin) }}</span>
                                        </div>
                                        <div :class="isObservationPersonnalisedClass(engin)">
                                            <img class="imgClass" src="@/assets/icons/observation/font.png" height="25px" width="auto">
                                        </div>
                                        <div :class="isConsignePersonnalisedClass(engin)">
                                            <img class="imgClass" src="@/assets/icons/observation/consigne.png" height="25px" width="auto">
                                        </div>
                                        <div :class="isCodeAppairageClass(engin)">
                                            <img class="imgClass" src="@/assets/icons/observation/secure-password.png" height="25px" width="auto">
                                        </div>
                                    </div>
                                    <div v-else>
                                        <div class="noAgent">Aucun agent affecté</div>
                                    </div> 
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="colonne2">
            <div class="subtitle">
                Personnalisation des engins
            </div>
            <div v-if="enginAPersonnaliser">
                <div class="subsubtitle">
                    {{ enginAPersonnaliser.engin }} ({{ enginAPersonnaliser.caserne }})
                </div>
                <div class="subsubtitle">
                    GFO
                </div>
                <InputText v-model="enginAPersonnaliser.gfo" placeholder="Inscrire un GFO" class="w-full md:w-14rem" />
                <div class="subsubtitle">
                    Code appairage
                </div>
                <InputText v-model="enginAPersonnaliser.codeAppairage" placeholder="Inscrire un code d'appairage" class="w-full md:w-14rem" />
                <div class="subsubtitle">
                    Observation
                </div>
                <p class="greyText">
                    Cette observation personnalisée sera présente pour cet engin uniquement.
                    <br>
                    Elle commencera par <b>**</b> sur l'ordre de départ.
                </p>
                <div>
                    <Textarea v-model="enginAPersonnaliser.observationParticuliere" autoResize rows="4" cols="50" placeholder="Ex : Pour renfort brancardage" />
                </div>
                <div class="subsubtitle">
                    Consigne personnalisée
                </div>
                <p class="greyText">
                    Cette consigne personnalisée sera présente pour cet engin uniquement.
                </p>
                <div>
                    <Textarea v-model="enginAPersonnaliser.consigneParticuliere" autoResize rows="4" cols="50" placeholder="Ex: prendre le mémento opérationnel..." />
                </div>
                <div class="subsubtitle">
                    Affectation PRV / PRM / PRI
                </div>
                <div v-if="selectedAddressPRV">
                    <Checkbox v-model="enginAPersonnaliser.affectationPRV" inputId="affectationPRV" name="affectationPRV" value="false" :disabled="enginAPersonnaliser.affectationPRI != '' || enginAPersonnaliser.affectationPRM != ''" />
                    <label for="affectationPRV">Affecter cet engin au PRV</label>
                </div>
                <div v-if="selectedAddressPRM">
                    <Checkbox v-model="enginAPersonnaliser.affectationPRM" inputId="affectationPRM" name="affectationPRM" value="false" :disabled="enginAPersonnaliser.affectationPRI != '' || enginAPersonnaliser.affectationPRV != ''" />
                    <label for="affectationPRM">Affecter cet engin au PRM</label>
                </div>
                <div v-if="selectedAddressPRI">
                    <Checkbox v-model="enginAPersonnaliser.affectationPRI" inputId="affectationPRI" name="affectationPRI" value="false" :disabled="enginAPersonnaliser.affectationPRV != '' || enginAPersonnaliser.affectationPRM != ''" />
                    <label for="affectationPRI">Affecter cet engin au PRI</label>
                </div>
                <div v-if="!selectedAddressPRV && !selectedAddressPRM && !selectedAddressPRI">
                    <div class="noAgent">Aucun PRV, PRM ou PRI n'a été ajouté.</div>
                </div>
                <div class="subsubtitle">
                       Affectation Remorque / Lot
                </div>
                    <Dropdown v-model="enginAPersonnaliser.remorque" :options="lotsRemorques" optionLabel="label" filter optionValue="code" placeholder="Sélectionner une remorque/lot"/>
                <div class="validationBtn" @click="processEnginPersonnalise">Enregistrer & fermer</div>
            </div>
            <div v-else>
                <div class="noAgent">Aucun engin sélectionné.</div>
            </div>
        </div>
        <div class="validationBtn" id="validationBtn3" @click="processAllData"><span v-if="loading"><img src="@/assets/loading2.gif" alt="" width="20px" height="auto"></span><span v-else>Valider l'ordre de départ</span></div>
        <div class="returnButton" @click="step = 4">Retour</div>    
    </div>
            <div id="layoutMargin"></div>
        </div>
    </div>
</template>

<script setup>
import useComputer from '../components/useComputer.vue';
import { useSqlStore } from "@/stores/database.js";
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import AutoComplete from 'primevue/autocomplete';
import MultiSelect from 'primevue/multiselect';
import Listbox from 'primevue/listbox';
import CascadeSelect from 'primevue/cascadeselect';
import Chips from 'primevue/chips';
import { ref, watch, computed } from "vue";


import BPSM from '../assets/icons/engins/Dl-BPSM.png';
import VSAV from '../assets/icons/engins/Dl-VSAV.png';
import FPTL from '../assets/icons/engins/Dl-FPTL.png';
import VLCDG from '../assets/icons/engins/Dl-VLCDG.png';
import VFI from '../assets/icons/engins/Dl-VFI.png';
import VTUTP from '../assets/icons/engins/Dl-VTUTP.png';

const engIcons = {
    'BPSM': BPSM,
    'VSAV': VSAV,
    'FPTL': FPTL,
    'VLCDG': VLCDG,
    'VFI': VFI,
    'VTUTP': VTUTP
}

const verifyIfPhone = () => {
    return window.innerWidth < 768;
}
const showApp = ref(false);
const step = ref(1);
const manualHour = ref(false);
const timeDateInter = ref(new Date());
const sinistres = ref([]);
const selectedSinistre = ref();
const selectedAddress = ref();
const searchedAddress = ref([]);
const showAddress = ref(false);
const showPopup = ref(false);
const popupTitle = ref('');
const popupGFO = ref('');
const popupEngin = ref('');
const popupRole = ref('');
const loading = ref(false);
const toAddGfo = ref();
const moreAddress = ref({});
const consigneGenerale = ref('');
const mapSource = ref('https://www.openstreetmap.org/export/embed.html?bbox=4.84536498785019%2C45.81678043065213%2C4.84785407781601%2C45.8180572020597&amp;layer=mapnik&amp&amp;zoom=13.5');

const sqlStore = useSqlStore();

async function getSinistres(){
    await sqlStore.getListSinistres();
    sinistres.value = await sqlStore.listSinistres;
}

const observationGenerale = ref('');

watch(selectedAddress, (newValue) => {
    if (newValue) {
        processAddress({ value: newValue });
    }
});

const placeholderObs = `Exemple:
A la demande du SAMU
Victime F 28 ans 
ATCD 0...`

async function processAddress(){
    if (!selectedAddress.value || typeof selectedAddress.value !== 'object') {
        return;
    }
    let lon = selectedAddress.value.lon;
    let lat = selectedAddress.value.lat;
    const box = `${lon - 0.001},${lat - 0.001},${lon + 0.001},${lat + 0.001}`.replace(/,/g, '%2C');
    mapSource.value = `https://www.openstreetmap.org/export/embed.html?bbox=${box}&amp;layer=mapnik&amp;marker=${lon}%2C${lat}&amp;zoom=13&amp`;
}

const search = async (event) => {
    if (event.query.length <= 1) {
        return;
    }
    await sqlStore.searchAddress(event.query);
    searchedAddress.value = await sqlStore.searchedAddress;
    searchedAddressPRM.value = await sqlStore.searchedAddress;
    searchedAddressPRV.value = await sqlStore.searchedAddress;
    searchedAddressPRI.value = await sqlStore.searchedAddress;
}

getSinistres();

const grades = ref([
    "SAP",
    "CAP",
    "CCH",
    "SGT",
    "SCH",
    "ADJ",
    "ADC",
    "LTN",
    "CNE",
    "CDT",
    "LCL",
    "COL",
    "CGL",
    "INF",
    "EXP"
])

let timeDateInterInterval = setInterval(() => {
    if (!manualHour.value){
    timeDateInter.value = new Date();
    } else {
        clearInterval(timeDateInterInterval);
    }
}, 1000);

const addressVoie = ref('Voie de base');
const addressCommune = ref('Commune de base');
const addressLivre = ref('Collonges');
const coordonnees = ref('Coordonnées de base');
const erp = ref('');
const addressBatiment = ref('');
const addressEtage = ref('');
const prmCondition = ref(false);
const selectedAddressPRM = ref();
const searchedAddressPRM = ref([]);
const showAddress2 = ref(false);
const addressVoiePRM = ref('Voie de base');
const addressCommunePRM = ref('Commune de base');
const addressLivrePRM = ref('Collonges');
const coordonneesPRM = ref('Coordonnées de base');
const erpPRM = ref('');
const addressBatimentPRM = ref('');
const addressEtagePRM = ref('');
const gfos = ref([]);
const gfosBase = ref([]);
const addressLivrePRV = ref('Collonges');
const addressEtagePRV = ref('');
const addressBatimentPRV = ref('');
const selectedAddressPRV = ref();
const searchedAddressPRV = ref([]);
const showAddress3 = ref(false);
const addressVoiePRV = ref('Voie de base');
const addressCommunePRV = ref('Commune de base');
const coordonneesPRV = ref('Coordonnées de base');
const erpPRV = ref('');
const prvCondition = ref(false);
const addressLivrePRI = ref('Collonges');
const addressEtagePRI = ref('');
const addressBatimentPRI = ref('');
const selectedAddressPRI = ref();
const searchedAddressPRI = ref([]);
const showAddress4 = ref(false);
const addressVoiePRI = ref('Voie de base');
const addressCommunePRI = ref('Commune de base');
const coordonneesPRI = ref('Coordonnées de base');
const erpPRI = ref('');
const priCondition = ref(false);
const availableRoles = ref([]);
const enginsGfo = ref([]);

const livres = ["Collonges",  "Fontaines", "Caluire","LYON RD", "Albigny", "Neuville", "Rillieux", "StDidier"];
const erpList = ref([]);
const etages = ["MI","VP", "-3", "-2", "-1", "RdC", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];
const sinistresAqua = ["1186", "2310", "5120", "4140", "3563", "4153"];
const sinistresSUAPNiv2 = ["1110", "1120"];

const hydrants = ref([]);

const getMoreAddress = async () => {
    loading.value = true;
    await sqlStore.getMoreAddress(selectedAddress.value.lon, selectedAddress.value.lat);
    moreAddress.value = await sqlStore.moreAddress;
    showAddress.value = true;
    console.log(moreAddress.value);
    addressVoie.value = selectedAddress.value.housenumber ? selectedAddress.value.housenumber + ' ' + selectedAddress.value.street : selectedAddress.value.street;
    addressCommune.value = selectedAddress.value.city.toUpperCase();
    coordonnees.value = moreAddress.value.mapCoordinates == "inconnu" ? "" : moreAddress.value.mapCoordinates;
    erpList.value.push(" ");
    hydrants.value = moreAddress.value.fireHydrants;
    for (const erp of moreAddress.value.erp){
        erpList.value.push(erp.feature.toUpperCase().replace(/GROUPEMENT/g, 'GT').replace(/ETABLISSEMENT/g, 'ETB'));	
    }
    if(moreAddress.value.erp[0].distance < 60){
        erp.value = moreAddress.value.erp[0].feature.toUpperCase().replace(/GROUPEMENT/g, 'GT');
    }
    
    loading.value = false;
}
const getMoreAddress2 = async () => {
    loading.value = true;
    await sqlStore.getMoreAddress(selectedAddressPRM.value.lon, selectedAddressPRM.value.lat);
    moreAddress.value = await sqlStore.moreAddress;
    showAddress2.value = true;
    console.log(moreAddress.value);
    addressVoiePRM.value = selectedAddressPRM.value.housenumber ? selectedAddressPRM.value.housenumber + ' ' + selectedAddressPRM.value.street : selectedAddressPRM.value.street;
    addressCommunePRM.value = selectedAddressPRM.value.city.toUpperCase();
    coordonneesPRM.value = moreAddress.value.mapCoordinates == "inconnu" ? "" : moreAddress.value.mapCoordinates;
    erpList.value.push(" ");
    for (const erp of moreAddress.value.erp){
        erpList.value.push(erp.feature.toUpperCase().replace(/GROUPEMENT/g, 'GT').replace(/ETABLISSEMENT/g, 'ETB'));	
    }
    if(moreAddress.value.erp[0].distance < 60){
        erpPRM.value = moreAddress.value.erp[0].feature.toUpperCase().replace(/GROUPEMENT/g, 'GT');
    }
    
    loading.value = false;
}

const getMoreAddress3 = async () => {
    loading.value = true;
    await sqlStore.getMoreAddress(selectedAddressPRV.value.lon, selectedAddressPRV.value.lat);
    moreAddress.value = await sqlStore.moreAddress;
    showAddress3.value = true;
    console.log(moreAddress.value);
    addressVoiePRV.value = selectedAddressPRV.value.housenumber ? selectedAddressPRV.value.housenumber + ' ' + selectedAddressPRV.value.street : selectedAddressPRV.value.street;
    addressCommunePRV.value = selectedAddressPRV.value.city.toUpperCase();
    coordonneesPRV.value = moreAddress.value.mapCoordinates == "inconnu" ? "" : moreAddress.value.mapCoordinates;
    erpList.value.push(" ");
    for (const erp of moreAddress.value.erp){
        erpList.value.push(erp.feature.toUpperCase().replace(/GROUPEMENT/g, 'GT').replace(/ETABLISSEMENT/g, 'ETB'));	
    }
    if(moreAddress.value.erp[0].distance < 60){
        erpPRV.value = moreAddress.value.erp[0].feature.toUpperCase().replace(/GROUPEMENT/g, 'GT');
    }
    
    loading.value = false;
}

const getMoreAddress4 = async () => {
    loading.value = true;
    await sqlStore.getMoreAddress(selectedAddressPRI.value.lon, selectedAddressPRI.value.lat);
    moreAddress.value = await sqlStore.moreAddress;
    showAddress4.value = true;
    console.log(moreAddress.value);
    addressVoiePRI.value = selectedAddressPRI.value.housenumber ? selectedAddressPRI.value.housenumber + ' ' + selectedAddressPRI.value.street : selectedAddressPRI.value.street;
    addressCommunePRI.value = selectedAddressPRI.value.city.toUpperCase();
    coordonneesPRI.value = moreAddress.value.mapCoordinates == "inconnu" ? "" : moreAddress.value.mapCoordinates;
    erpList.value.push(" ");
    for (const erp of moreAddress.value.erp){
        erpList.value.push(erp.feature.toUpperCase().replace(/GROUPEMENT/g, 'GT').replace(/ETABLISSEMENT/g, 'ETB'));	
    }
    if(moreAddress.value.erp[0].distance < 60){
        erpPRI.value = moreAddress.value.erp[0].feature.toUpperCase().replace(/GROUPEMENT/g, 'GT');
    }
    
    loading.value = false;
}

const isLoading = () => {
    return loading.value ? 'loading' : '';
}

const loadRoles = async () => {
    if (popupGFO.value){
        await sqlStore.getAvailableEngins(popupGFO.value);
        enginsGfo.value = sqlStore.availableEngins;
        await sqlStore.getAvailableRoles(popupGFO.value);
        availableRoles.value = sqlStore.availableRoles;
    }
}
const lotsRemorques = ref();
let maxConfigCollonges = computed(() => {
    const max = {
    "SAP" : 2,
    "PSSAP": 3,
    "PSINC": 1,
    "INC": 1,
    "INFAMU": 2,
    "CDG": 2,
    "AQUA": 1,
    "DIV": 2,
    "DIVPRE": 1,
    "BATO": 1
    }
    const result = [];
    for (const gfo of gfos.value){
        if (gfo == "AQUA"){
            max["AQUA"] -= 1;
            max["DIV"] -= 1;
            max["DIVPRE"] -= 1;
            max["PSSAP"] -= 1;
        } else if (gfo == "INFAMU") {
            max["INFAMU"] -= 1;
            max["CDG"] -= 1;
            max["DIV"] -= 1;
        } else if (gfo == "DIVPRE"){
            max["DIVPRE"] -= 1;
            max["DIV"] -= 1;
            max["PSSAP"] -= 1;
        } else if (gfo == "SAP") {
            max["SAP"] -= 1;
            max["PSSAP"] -= 1;
        } else if (gfo == "PSSAP"){
            max["PSSAP"] -= 1;
            max["SAP"] -= 1;
        } else if (gfo == "PSINC"){
            max["PSINC"] -= 1;
            max["INC"] -= 1;
        } else if (gfo == "INC"){
            max["INC"] -= 1;
            max["PSINC"] -= 1;
        } else if (gfo == "CDG"){
            max["CDG"] -= 1;
            max["INFAMU"] -= 1;
        } else if (gfo == "DIV"){
            max["DIV"] -= 1;
            max["CDG"] -= 1;
            max["INFAMU"] -= 1;
            max["DIVPRE"] -= 1;
            max["PSSAP"] -= 1;
            max["AQUA"] -= 1;
        }
    }
    for (const [key, value] of Object.entries(max)){
        value > 0 ? result.push(key) : null;
    }

    return result;
})

const manuallyAddedGFO = ref([]);

const twentyPercentAffected = () => {
    for (const agent of toAffectAgents.value){
        if (agent.emploi != '' && agent.engin != ''){
            return true;
        }
    }
    return false;
}

const getSinistreGFO = async () => {
    const possibleGFO = ["SAP", "PSSAP", "PSINC", "INC", "INFAMU", "CDG", "AQUA", "DIV", "DIVPRE", "BATO"];
    if (selectedSinistre.value && selectedSinistre.value.listGfo) {
        gfos.value = selectedSinistre.value.listGfo.filter(gfo => possibleGFO.includes(gfo));
        gfosBase.value = selectedSinistre.value.listGfo.filter(gfo => possibleGFO.includes(gfo));
        if (gfos.value.filter(gfo => gfo === "INC").length > 1) {
            const index = gfos.value.lastIndexOf("INC");
            if (index > -1) {
                gfos.value.splice(index, 1);
                manuallyAddedGFO.value.push("INC");
            }
        }
        if (sinistresAqua.includes(selectedSinistre.value.code)) {
            consigneGenerale.value = `Pour communiquer avec le CDG du SDMIS, veiller la SPE1 au Nord du pont de Givors, Pour communiquer avec le CDG du 38 (COS en aval du pk18), veiller la DIR624 au Sud du pont de Givors.
Prendre Atlas fluvial Rhône / Saône`;
        }
        if (sinistresSUAPNiv2.includes(selectedSinistre.value.code)) {
            consigneGenerale.value = `Port EPI SUAP niveau 2`;
        }
    }
}
const gfoSuppression = computed(() => {
    if (!Array.isArray(gfosBase.value) || gfosBase.value.length == 0) {
        return [];
    }

    return [...manuallyAddedGFO.value,...gfosBase.value.filter(gfo => !gfos.value.includes(gfo))];
})

const gfoAddition = computed(() => {
    if (!Array.isArray(gfosBase.value) || gfosBase.value.length == 0) {
        return [];
    }

    return gfos.value.filter(gfo => !gfosBase.value.includes(gfo));
})
const affectationPersonnalises = ref([]);
const addGfo = () => {
    if (toAddGfo.value){
        gfos.value.push(toAddGfo.value);
    }
    toAddGfo.value = null;
}

const step2Possible = computed(() => {
    return selectedAddress.value && selectedSinistre.value && gfos.value.length > 0;
})
const selectedAgents = ref([]);
const toAffectAgents = ref([]);
const step3function = () => {
    step.value = 3;
    toAffectAgents.value = selectedAgents.value.map(agent => ({ ...agent, emploi: "", engin: "" }));
}
const agents = ref([]);

const getAgentsList = async () => {
    await sqlStore.getAgentsList();
    agents.value = await sqlStore.agentsList;
}
getAgentsList();

const getIconSrc = (enginName) => {
    return engIcons[enginName.split('-')[0]];
}

const enginsAffected = ref([
    {engin : "VSAV-1",
     caserne: "COLLONGE",
        affectation : []
    },
    {engin : "VSAV-2",
    caserne: "COLLONGE",
        affectation : []
    },
    {engin : "FPTL-1",
    caserne: "COLLONGE",
        affectation : []
    },
    {engin : "VTUTP-1",
    caserne: "COLLONGE",
        affectation : []
    },
    {engin : "VLCDG-1",
    caserne: "COLLONGE",
        affectation : []
    },
    {engin : "VFI-1",
    caserne: "COLLONGE",
        affectation : []
    },
    {engin : "BPSM-1",
    caserne: "COLLONGE",
        affectation : []
    }
]);

const affectAgentManually = (agent) => {
    popupTitle.value = agent.label;
    showPopup.value = true;
}

const manuallyAddedAgent = ref('');
const addManually = () => {
    const agent = agents.value.find(agent => agent.matricule == manuallyAddedAgent.value);
    if (agent && !selectedAgents.value.includes(agent)){
        selectedAgents.value.push(agent);
        manuallyAddedAgent.value = '';
    }
}
const isAnAgent = computed(() => {
    const agent = agents.value.find(agent => agent.matricule == manuallyAddedAgent.value);
    if (agent){
        return true;
    }
    return false;
})

const affectAgent = () => {
    const agent = toAffectAgents.value.find(agent => agent.label == popupTitle.value);
    const engin = enginsAffected.value.find(engin => engin.engin == popupEngin.value);
    const role = availableRoles.value.find(role => role == popupRole.value);
    if (agent && engin && role){
        engin.affectation.push({ ...agent, emploi: role, engin: popupEngin.value });
        affectationPersonnalises.value.push({ ...agent, emploi: role, engin: popupEngin.value });
        agent.emploi = role;
        agent.engin = popupEngin.value;
        showPopup.value = false;
        popupGFO.value = '';
        popupEngin.value = '';
        popupRole.value = '';
        engin.affectation.sort((a, b) => {
        return roleOrder[a.emploi.split("_")[1]] - roleOrder[b.emploi.split("_")[1]];
    });
    }
    enginsAffected.value.sort((a, b) => b.affectation.length - a.affectation.length);
}

const removeAffectation = (agent) => {
    const engin = enginsAffected.value.find(engin => engin.affectation.find(affectation => affectation.matricule == agent.matricule));
    const affectation = engin.affectation.find(affectation => affectation.matricule == agent.matricule);
    const agentToModify = toAffectAgents.value.find(agent => agent.matricule == affectation.matricule);
    agentToModify.emploi = '';
    agentToModify.engin = '';
    engin.affectation = engin.affectation.filter(affectation => affectation.matricule != agent.matricule);
    affectationPersonnalises.value = affectationPersonnalises.value.filter(affectation => affectation.matricule != agent.matricule);
    engin.affectation.sort((a, b) => {
        return roleOrder[a.emploi.split("_")[1]] - roleOrder[b.emploi.split("_")[1]];
    });
}

const roleOrder = {
    "ca": 1,
    "inf":1,
    "cdg": 1,
    "cd":2,
    "ce":3,
    "eq":4,
    "eqc":5
}

const automaticAffectation = async () => {
    loading.value = true;
    const payload = {
        "matricules" : toAffectAgents.value.map(agent => agent.matricule),
        "codeSinistre" : selectedSinistre.value.code,
        "personnalise": {
            "agents": affectationPersonnalises.value,
            "gfo_additionnel" : gfoAddition.value,
            "gfo_suppression" : gfoSuppression.value
        }
    }
    await sqlStore.automaticAffectation(payload);
    const automaticAffectations = sqlStore.automaticAffectationRes.affectation;
    for (const vehicule of automaticAffectations) {
        const engin = enginsAffected.value.find(e => e.engin === vehicule.engin);
        if (engin) {
            engin.affectation = [];
            vehicule.affectation.forEach(agent => {
            if (agent.matricule) {
                engin.affectation.push({
                matricule: agent.matricule,
                label: `${agent.grade.length <= 4 ? agent.grade : sqlStore.gradeAbbreviation(agent.grade)} ${agent.nom} ${agent.prenom}`,
                emploi: agent.emploi,
                engin: agent.engin,
                grade: agent.grade.length <= 4 ? agent.grade : sqlStore.gradeAbbreviation(agent.grade)
                });
                const agentToModify = toAffectAgents.value.find(a => a.matricule === agent.matricule);
                agentToModify.emploi = agent.emploi;
                agentToModify.engin = agent.engin;
                engin.affectation.sort((a, b) => {
                    return roleOrder[a.emploi.split("_")[1]] - roleOrder[b.emploi.split("_")[1]];
                });
            }
            });
        }
    }
    enginsAffected.value.sort((a, b) => b.affectation.length - a.affectation.length);
    loading.value = false;
}

const enginsAffectedExt = computed (() => {
    return enginsAffected.value.filter(engin => engin.caserne != "COLLONGE" || engin.affectation.some(agent => !/^V\d{5}$/.test(agent.matricule)));
})
const popupEnginExtCond = ref(false);
const enginsListAll = ref([]);
const caserneList = ref([]);
const popupEnginExt = ref('');
const popupCaserneExt = ref('');
const popupEnginNum = ref('');
const addCaserneEngin = () => {
    loading.value = true;
    enginsAffected.value.push({
        engin: `${ popupEnginExt.value.code }-${ popupEnginNum.value }`,
        caserne: popupCaserneExt.value.shortname,
        affectation: []
    });
    popupEnginExt.value = '';
    popupCaserneExt.value = '';
    popupEnginNum.value = '';
    popupEnginExtCond.value = false;
    loading.value = false;
}
async function getEnginsFromStore () {
    await sqlStore.getVehiculesAndCasernesList();
    enginsListAll.value = sqlStore.vehiculesList;
    caserneList.value = sqlStore.casernesList;
    lotsRemorques.value = enginsListAll.value.filter(engin => engin.code.startsWith('L') || engin.name.toLowerCase().includes('remorque'))
    .map(engin => ({ name: engin.name, code: engin.code, label: `${engin.code} - ${engin.name}` }));
}
getEnginsFromStore();
const startAddEngin = async () => {
    loading.value = true;
    popupEnginExtCond.value = true;
}
const groupedByCaserneEngins = computed(() => {
    const grouped = [];
    for (const engin of enginsAffected.value) {
        let caserneGroup = grouped.find(group => group.caserne === engin.caserne);
        if (!caserneGroup) {
            caserneGroup = { caserne: engin.caserne, vehicules: [] };
            grouped.push(caserneGroup);
        }
        caserneGroup.vehicules.push({ name: engin.engin, caserne: engin.caserne, affectation: engin.affectation });
    }
    return grouped;
})

const startAddAgent = () => {
    loading.value = true;
    popupAgentExtCond.value = true;
}
const popupAgentExtCond = ref(false);
const gradePopupAgent = ref('');
const nomPopupAgent = ref('');
const prenomPopupAgent = ref('');
const gfoPopupAgent = ref('');
const rolePopupAgent = ref('');
const affectationPopupAgent = ref('');

const addAgentPopup = () => {
    const agent = {
        matricule: `${nomPopupAgent.value.toUpperCase().substring(0, 3)}${prenomPopupAgent.value.toUpperCase().substring(0, 3)}`,
        grade: gradePopupAgent.value,
        nom: nomPopupAgent.value.toUpperCase(),
        prenom: prenomPopupAgent.value,
        label: `${gradePopupAgent.value} ${nomPopupAgent.value.toUpperCase()} ${prenomPopupAgent.value}`,
        emploi: gfoPopupAgent.value.toUpperCase() + '_' + rolePopupAgent.value.toLowerCase(),
        engin: affectationPopupAgent.value.name
    }
    toAffectAgents.value.push(agent);
    const engin = enginsAffected.value.find(e => e.engin === affectationPopupAgent.value.name && e.caserne === affectationPopupAgent.value.caserne);
    if (engin) {
        engin.affectation.push({
            matricule: agent.matricule,
            label: `${agent.grade} ${agent.nom} ${agent.prenom}`,
            emploi: agent.emploi,
            engin: agent.engin,
            grade: agent.grade
        });
        engin.affectation.sort((a, b) => {
            return roleOrder[a.emploi.split("_")[1]] - roleOrder[b.emploi.split("_")[1]];
        });
    }
    loading.value = false;
    popupAgentExtCond.value = false;
    gradePopupAgent.value = '';
    nomPopupAgent.value = '';
    prenomPopupAgent.value = '';
    gfoPopupAgent.value = '';
    rolePopupAgent.value = '';
    affectationPopupAgent.value = '';
    loading.value = false;
}

const affectAgentManuallyExt = (agent) => {
    const engin = enginsAffected.value.find(e => e.affectation.find(a => a.matricule === agent.matricule));
    if (engin) {
        engin.affectation = engin.affectation.filter(a => a.matricule !== agent.matricule);
    }
    toAffectAgents.value = toAffectAgents.value.filter(a => a.matricule !== agent.matricule);
    gradePopupAgent.value = agent.grade;
    nomPopupAgent.value = agent.nom;
    prenomPopupAgent.value = agent.prenom;
    gfoPopupAgent.value = agent.emploi.split('_')[0];
    rolePopupAgent.value = agent.emploi.split('_')[1];
    affectationPopupAgent.value = "";
    popupAgentExtCond.value = true;
    
}

const removeAffectationExt = (agent) => {
    const engin = enginsAffected.value.find(e => e.affectation.find(a => a.matricule === agent.matricule));
    if (engin) {
        engin.affectation = engin.affectation.filter(a => a.matricule !== agent.matricule);
    }
    toAffectAgents.value = toAffectAgents.value.filter(a => a.matricule !== agent.matricule);
    gradePopupAgent.value = agent.grade;
    nomPopupAgent.value = agent.nom;
    prenomPopupAgent.value = agent.prenom;
    gfoPopupAgent.value = agent.emploi.split('_')[0];
    rolePopupAgent.value = agent.emploi.split('_')[1];
    affectationPopupAgent.value = "";
    popupAgentExtCond.value = true;
    
}

const toAffectAgentsExt = computed(() => {
    return toAffectAgents.value.filter(agent => agent.engin != '' && !/^V\d{5}$/.test(agent.matricule));
});
const enginsAffectedWithPeople = ref([]);

const enginsAvecOrdreDepart = ref([]);
const prepareStep5 = () => {
    step.value = 5;
    const enginsAffectedWithPpl = enginsAffected.value.filter(engin => engin.affectation.length > 0);
    enginsAffectedWithPeople.value = enginsAffectedWithPpl;
    let newDate = new Date(timeDateInter.value);
    let day = newDate.getDate().toString().padStart(2, '0');
    let month = (newDate.getMonth() + 1).toString().padStart(2, '0');
    let year = newDate.getFullYear();
    let hours = newDate.getHours().toString().padStart(2, '0');
    let minutes = newDate.getMinutes().toString().padStart(2, '0');
    let seconds = newDate.getSeconds().toString().padStart(2, '0');
    let dateString = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    enginsAvecOrdreDepart.value = [
        { ordreDepart : 1,
            timeDate : dateString,
            engins : enginsAffectedWithPpl.map(engin => ({
            ...engin,
            gfo : engin.affectation.length > 0 ? engin.affectation[0].emploi.split('_')[0] : '',
            observationParticuliere: '',
            affectationPRM: '',
            affectationPRI: '',
            affectationPRV: '',
            consigneParticuliere: '',
            remorque: '',
            codeAppairage: '',
        }))
        }
    ]    
}

const enginAPersonnaliser = ref('');
const ouvrirCaracteristiques = (engin) => {
    if (enginAPersonnaliser.value != ''){
        for (let OD of enginsAvecOrdreDepart.value){
            for (let engin of OD.engins){
                if (engin.engin == enginAPersonnaliser.value.engin && engin.caserne == enginAPersonnaliser.value.caserne){
                    engin.observationParticuliere = enginAPersonnaliser.value.observationParticuliere;
                    engin.gfo = enginAPersonnaliser.value.gfo;
                    engin.codeAppairage = enginAPersonnaliser.value.codeAppairage;
                    engin.affectationPRM = enginAPersonnaliser.value.affectationPRM;
                    engin.affectationPRI = enginAPersonnaliser.value.affectationPRI;
                    engin.affectationPRV = enginAPersonnaliser.value.affectationPRV;
                    engin.consigneParticuliere = enginAPersonnaliser.value.consigneParticuliere;
                    engin.remorque = enginAPersonnaliser.value.remorque;
                }
            }
        }
    }
    enginAPersonnaliser.value = engin;
} 
const processEnginPersonnalise = () => {
    for (let OD of enginsAvecOrdreDepart.value){
        for (let engin of OD.engins){
            if (engin.engin == enginAPersonnaliser.value.engin && engin.caserne == enginAPersonnaliser.value.caserne){
                engin.observationParticuliere = enginAPersonnaliser.value.observationParticuliere;
                engin.gfo = enginAPersonnaliser.value.gfo;
                engin.codeAppairage = enginAPersonnaliser.value.codeAppairage;
                engin.affectationPRM = enginAPersonnaliser.value.affectationPRM;
                engin.affectationPRI = enginAPersonnaliser.value.affectationPRI;
                engin.affectationPRV = enginAPersonnaliser.value.affectationPRV;
                engin.consigneParticuliere = enginAPersonnaliser.value.consigneParticuliere;
                engin.remorque = enginAPersonnaliser.value.remorque;
            }
        }
    }
    enginAPersonnaliser.value = '';
}

const isBeingPersonnalised = (engin) => {
    if (enginAPersonnaliser.value.engin == engin.engin && enginAPersonnaliser.value.caserne == engin.caserne) {
        return "personnalizeEngin";
    } else {
        return '';
    }
}

const isAddressPersonnalised = (engin) => {
    if (engin.affectationPRM != '' || engin.affectationPRI != '' || engin.affectationPRV != '') {
        return (engin.affectationPRM != '' ? 'PRM' : '') + (engin.affectationPRI != '' ? 'PRI' : '') + (engin.affectationPRV != '' ? 'PRV' : '');
    } else {
        return '';
    }
}

const isAddressPersonnalisedClass = (engin) => {
    if (engin.affectationPRM != '' || engin.affectationPRI != '' || engin.affectationPRV != '') {
        return "opacityNinty";
    } else {
        return 'opacityFifty';
    }
}

const isRemorquePersonnalisedClass = (engin) => {
    if (engin.remorque != '') {
        return 'opacityNinty';
    } else {
        return 'opacityFifty';
    }
}
const isCodeAppairageClass = (engin) => {
    if (engin.codeAppairage != '') {
        return 'opacityNinty';
    } else {
        return 'opacityFifty';
    }
}

const isRemorquePersonnalised = (engin) => {
    if (engin.remorque != '') {
        return engin.remorque;
    } else {
        return '';
    }
}

const isObservationPersonnalisedClass = (engin) => {
    if (engin.observationParticuliere != '') {
        return 'opacityNinty';
    } else {
        return 'opacityFifty';
    }
}

const isConsignePersonnalisedClass = (engin) => {
    if (engin.consigneParticuliere != '') {
        return 'opacityNinty';
    } else {
        return 'opacityFifty';
    }
}

const enginsToAddOD = ref([]);
const tempsEcoule = ref("");
const addODCond = ref(false);

const addOD = () => {
    let enginstoAddList = [];
    for (let OD of enginsAvecOrdreDepart.value){
        for (let engin of OD.engins){
            if (enginsToAddOD.value.some(e => e.engin === engin.engin && e.caserne === engin.caserne)){
                enginstoAddList.push(engin);
                OD.engins = OD.engins.filter(e => e.engin != engin.engin || e.caserne != engin.caserne);
            }
        }
    }
    let newDate = new Date(timeDateInter.value.getTime() + parseInt(tempsEcoule.value) * 60000);
    let day = newDate.getDate().toString().padStart(2, '0');
    let month = (newDate.getMonth() + 1).toString().padStart(2, '0');
    let year = newDate.getFullYear();
    let hours = newDate.getHours().toString().padStart(2, '0');
    let minutes = newDate.getMinutes().toString().padStart(2, '0');
    let seconds = newDate.getSeconds().toString().padStart(2, '0');
    let dateString = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    enginsAvecOrdreDepart.value.push({
        ordreDepart: enginsAvecOrdreDepart.value.length + 1,
        timeDate: dateString,
        engins: enginstoAddList
    });
    enginsToAddOD.value = [];
    tempsEcoule.value = "";
    addODCond.value = false;
}

const processAllData = async () => {
    loading.value = true;
    const payload = {
        "sinistre" : {
            "code" : selectedSinistre.value.code,
            "libelle" : selectedSinistre.value.label,
            "libelleComplet": selectedSinistre.value.labelComplet,
        },
        "adresses" : {
            "adresseCommune" : {
                "voie" : addressVoie.value,
                "commune" : addressCommune.value,
                "coordonnees" : coordonnees.value,
                "erp" : erp.value.startsWith("CT") || erp.value == '' ? erp.value : "ERP_" + erp.value,
                "batiment" : addressBatiment.value,
                "etage" : addressEtage.value,
                "livre" : addressLivre.value
            },
            "adressePRM" : {
                "voie" : addressVoiePRM.value,
                "commune" : addressCommunePRM.value,
                "coordonnees" : coordonneesPRM.value,
                "erp" : erpPRM.value.startsWith("CT") || erpPRM.value == '' ? erpPRM.value : "ERP_" + erpPRM.value,
                "batiment" : addressBatimentPRM.value,
                "etage" : addressEtagePRM.value,
                "livre" : addressLivrePRM.value
            },
            "adressePRI" : {
                "voie" : addressVoiePRI.value,
                "commune" : addressCommunePRI.value,
                "coordonnees" : coordonneesPRI.value,
                "erp" : erpPRI.value.startsWith("CT") || erpPRI.value == '' ? erpPRI.value : "ERP_" + erpPRI.value,
                "batiment" : addressBatimentPRI.value,
                "etage" : addressEtagePRI.value,
                "livre" : addressLivrePRI.value
            },
            "adressePRV" : {
                "voie" : addressVoiePRV.value,
                "commune" : addressCommunePRV.value,
                "coordonnees" : coordonneesPRV.value,
                "erp" : erpPRV.value.startsWith("CT") || erpPRV.value == '' ? erpPRV.value : "ERP_" + erpPRV.value,
                "batiment" : addressBatimentPRV.value,
                "etage" : addressEtagePRV.value,
                "livre" : addressLivrePRV.value
            },
            "hydrants": hydrants.value
        },
        "observation" : observationGenerale.value,
        "consigneGenerale" : consigneGenerale.value,
        "ordresDeparts" : enginsAvecOrdreDepart.value
    }
    await sqlStore.generateTelex(payload);
    loading.value = false;
    let htmlContent = sqlStore.telex;
        // Calculer la largeur et la hauteur de l'écran
    const screenWidth = screen.width * 0.9;
    const screenHeight = screen.height * 0.9;

    // Ouvrir une nouvelle fenêtre (popup) avec la taille de l'écran
    const popup = window.open("", "_blank", `width=${screenWidth},height=${screenHeight},left=0,top=0`);

    // Insérer le contenu HTML dans la popup
    if (popup) {
        popup.document.open(); // Ouvrir le document
        popup.document.write(htmlContent); // Écrire le contenu HTML
        popup.document.close(); // Fermer le flux d'écriture
        popup.focus(); // Assure que la popup est en avant-plan
    } else {
        const link = document.createElement('a');
        link.href = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
        link.download = `telex_${new Date().toISOString().split('T')[0]}.html`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.error("Impossible d'ouvrir la popup. Vérifiez si les popups sont bloquées par le navigateur.");
    }

}
const isBeingDragged = ref(false);
const dragStart = (event, agent) => {
    event.dataTransfer.setData('text', JSON.stringify(agent)); // Ajout du type 'text'
    isBeingDragged.value = true;
    setTimeout(() => {
        isBeingDragged.value = false;
    }, 10000);
}

const drop = (event, engin) => {
    event.preventDefault();
    isBeingDragged.value = false;
    try {
        const agent = JSON.parse(event.dataTransfer.getData('text'));
        popupTitle.value = agent.label;
        popupGFO.value = engin.affectation.length > 0 ? engin.affectation[0].emploi.split('_')[0] : '';
        popupEngin.value = engin.engin;
        popupRole.value = null;
        showPopup.value = true;
    } catch (error) {
        console.error("Erreur lors du parsing des données de transfert :", error);
    }
}

</script>

<style scoped>
.greyText, .agentMatricule{
    color: #666666;
    font-size: 0.8rem;
}
.greenText{
    color: #1f8d49;
    font-size: 0.8rem;
}
.redCross{
    color: red;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0.2rem;
}
.redCross:hover{
    background-color: red;
    border-radius: 5px;
    color: white;
}
.full {
    width: 100%;
}

.ODEnginsFlex{
    display: flex;
    flex-direction: row;
    gap: 1rem;
    flex-wrap: wrap;
    max-width: 80%;
}
.vehiculeBtn{
    cursor: pointer;
    transition: all 0.3s ease;
}
.vehiculeBtn:hover{
    background-color: #e0e0e0;
}
.twoColumns2{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
}
.greyBackground{
    background-color: #f6f6f6;
    border-radius: 30px;
    padding: 1rem;
}
.colonne1{
    margin-left: 1rem;
    padding-left: 2rem;
    padding-right: 2rem;
    flex: 0.6;
}
.step5{
    max-width: 95vw;
}
.opacityFifty{
    opacity: 0.5;
}
.blueShadow{
    box-shadow: 0 0 10px 0 rgba(0,120,243,0.5);
}
.blueShadow:hover{
    background-color: rgba(0,120,243,0.3);
}
.middle{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    padding: 1rem;
    margin-bottom: 2rem;
    width: 90vw;
}

.colonne2{
    padding: 1rem;
    padding-left: 2rem;
    padding-right: 2rem;
    background-color: #f6f6f6;
    border-radius: 30px;
    flex: 0.4;
    margin-right: 1rem;
    overflow: auto;
    max-height: 60vh;
}
#returnBtnStep2, .returnButton{
    background-color: #f6f6f6;
    color: #666666;
    padding: 0.5rem;
    border-radius: 30px;
    cursor: pointer;
    text-align: center;
    transition: all 0.3s ease;
    position: absolute;
    bottom: 1rem;
    transition: all 0.3s ease;
}
#returnBtnStep2:hover, .returnButton:hover{
    background-color: #e0e0e0;
}
.returnButton{
    position: fixed;
    bottom: 1.5rem;
    left: 3rem;
}
#validationBtn3{
    position: absolute;
    bottom: 1rem;
    right: 1rem;
}
.gfoList{
    margin-top: 1rem;
    max-width: 400px;
}
.agent{
    margin-top: 0.5rem;
    transition: all 0.3s ease;
}
.agent:hover{
    background-color: #e0e0e0;
    cursor: grab;
    border-radius: 5px;
}
.autoOverflow{
    overflow: auto;
    max-height: 80vh;
}
.autoOverflow2 {
    overflow: auto;
    max-height: 30vh;
}
.secondItem{
    margin-top: 1rem;
    max-width: 100px;
}
.flexed{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    background-color: white;
    padding: 0.5rem;
    border-radius: 30px;
    align-items: center;
    box-shadow: 0 0 5px 0 rgba(0,0,0,0.1);
}
.part2{
    flex: 0.9;
}
.marginTop{
    margin-top: 1rem;
}

.fullView {
    width: 100vw;
    height: 100vh;
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: white;
    top:0;
    left: 0;
}
#appStep1{
    padding-right: 5rem;
    transform: translateX(+5rem);
    overflow: auto;
}
#prvField, #priField, #prmField{
    margin-top: 1rem;
}
.asupButton:hover{
    background-color: #e0e0e0;
}
.return{
    position: fixed;
    top: 1rem;
    left: 1rem;
    cursor: pointer;
    background-color: #f0f0f0;
    padding: 0.5rem;
    border-radius: 30px;
    display: flex;
    
}
.flexx{
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
}
.vehiculeNameSpan{
    font-weight: bold;
    font-size: 1.2rem;
}
.arrow-button{
  background-color: #0078f3;
  flex: 0.2;
  border: none;
  color: white;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  margin-left: 1rem;
  cursor: pointer;
  border-radius: 5px;
  height: 2rem;
  min-width: 30px;
  transition: all 0.3s ease;
}
.arrow-button:hover{
  background-color: #6196ff;
}	
.loading{
    background-color: white;
    border: #0078f3 1px solid;
    cursor: not-allowed;
}
.twoColumns{
    width: 95vw;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
.firstColumn{
    flex: 0.2;
    overflow-x: auto;
    max-height: 80vh;
    background-color: #f6f6f6;
    border-radius: 30px;
    padding: 1rem;
}
.popupAffectation{
    position: fixed;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    border-radius: 30px;
    padding: 1rem;
    z-index: 1000;
    width: 30rem;
}
.blurBck{
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    backdrop-filter: blur(5px);
}
.secondColumn{
    flex: 0.9;
    padding: 1rem;
    padding-left: 2rem;
    padding-right: 2rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    overflow-y: auto;
    max-height: 80vh;
}
.vehicule{
    background-color: #f6f6f6;
    border-radius: 30px;
    padding: 1rem;
    width: 20rem;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
}
.vehiculeName{
    border-bottom: 1px solid #919191;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-bottom: 0.3rem;
    margin-bottom: 0.7rem;
}
.vehiculeName > img{
    margin-right: 1rem;
}
.affectAgentLink{
    color: #0078f3;
    cursor: pointer;
    text-decoration: underline;
}
.titleApp{
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    background-color: white;
    border-radius: 30px;
    width: 50%;
    text-align: center;
    padding: 1rem;
}
#layoutMargin{
    height: 7rem;
}
#coordonnees, #Batiment{
    margin-left: 1rem;

}
.logoApp{
    position: fixed;
    top: 1rem;
    right: 1rem;
}
.labelForm{
    font-weight: 700;
    color: #666666;
    margin-right: 2rem;
}
.return:hover{
    background-color: #e0e0e0;
}
.leftMargin{
    margin-left: 1rem;
}
.consigne{
    color: #666666;
    text-align: justify;
    margin-top: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e5e5;
    font-size: 0.8rem;
}
.consigne > .number{
    font-weight: bold;
    text-align: center;
    padding: 5px;
    padding-left: 10px;
    padding-right: 10px;
    margin: 5px;
    border-radius: 30px;
    color: white;
    background-color: #0078f3;
    font-size: 14px;
}
.TextHighlight{
    color: #0078f3;
    font-weight: bold;
    font-size: 0.8rem;
}
.vehiculeCaserneSpan{
    color: #666666;
    margin-left: 1rem;
}
.formElement{
    margin-top: 1rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
.formElement > div{
    margin-left: 1rem;
}
#mapid{
    position: fixed;
    left: 3rem;
    border-radius: 30px;
    overflow: hidden;
    scale: 1.5;
    width: 300px;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.subsubtitle{
    padding-top: 1rem;
    border-top: #e5e5e5 1px solid;
}
.noBorder{
    border-top: none;
}
.personnalizeEngin{
    background-color: #f4f6ff;
    color: #0063cb;
}
.vehiculegfo{
    text-align: right;
    margin-left: 2rem;
    background-color:white;
    padding: 0.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
    border-radius: 10px;
    }
.imgClass{
    width: 30px;
    height: 30px;
    border-radius: 200px;
    overflow: hidden;
}
.floattingBubble{
    position: relative;
    top: -1rem;
    left: -0.5rem;
    font-size: 0.8rem;
    background-image: linear-gradient(to right bottom, #0078f3 5%, #18753c 100%);
        background-size: 140% 140%;
			animation: gradient 2s ease infinite;
    color: white;
    padding: 0.2rem;
    padding-left: 0.4rem;
    padding-right: 0.4rem;
    border-radius: 200px;
}
.flexxx{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}
.opacityNinty{
    opacity: 0.75;
}
.opacityFifty{
    opacity: 0.3;
}
</style>