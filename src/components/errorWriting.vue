<template>
    <div>
        <div class="errorWriting">
            <div>
                <img src="@/assets/illustrations/beware.svg" width="50" height="auto" />
            </div>
            <div class="errorWritingText">
                <span>
                    Profil restreint
                </span><br>
                Votre profil n'inclut pas les permissions nécessaires pour écrire ou modifier la base de données.
            </div>
        </div>
    </div>
</template>
<script setup>
</script>
<style>
.errorWriting{
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    font-size: 0.8rem;
    background-color: #fff4f3;
    color: #ff6218;
    padding: 10px;
    border-radius: 10px;
}
.errorWritingText{
    margin-left: 10px;
    text-align: justify;
}
.errorWritingText > span{
    font-weight: bold;
    font-size: 1rem;
}
</style>