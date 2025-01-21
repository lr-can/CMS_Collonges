<template>
    <div class="gSheetBtn" @click="redirectToGoogleSheets()">
        <img src="@/assets/icons/GSHEETS.svg" alt="Google Sheets Logo" width="30px" height="auto">
    </div>

</template>
<script setup>
const redirectToGoogleSheets = () => {
    window.open('https://docs.google.com/spreadsheets/d/1aiagcxGaeehUTY8WEfY_ekOn3dol7HmveFylOWoX2OE/edit?gid=0#gid=0', '_blank');
}


</script>
<style scoped>
.gSheetBtn {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: #1f8d49;
    color: white;
    border-radius: 50px;
    transition: all 0.3s;
    padding: 10px;
    min-width: 10%;
    max-width: 20%;
}
.gSheetBtn:hover{
    background-color: #18753c;
}
</style>