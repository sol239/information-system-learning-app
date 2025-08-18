import { defineStore } from 'pinia'
import { ref } from 'vue'
import { UserRecord } from '~/model/UserRecord'

export const useScoreStore = defineStore('score', () => {
  // State
  const score = ref(0);
  const correctAnswers = ref(0);
  const wrongAnswers = ref(0);
  const userRecords = ref<UserRecord[]>([]);

  // Actions
  function addUserRecord(record: UserRecord) {
    userRecords.value.push(record);
  }

  function getUserRecords() {
    return userRecords.value;
  }

  function setScore(newScore: number) {
    score.value = newScore
  }

  function incrementCorrectAnswers() {
    correctAnswers.value += 1;
  }

  function incrementWrongAnswers() {
    wrongAnswers.value += 1;
  }

  function incrementScore() {
    score.value += 1;
  }

  function decrementScore() {
    score.value -= 1;
  }

  function updateScore() {
    score.value = correctAnswers.value - wrongAnswers.value;
  }

  function resetScore() {
    score.value = 0;
    correctAnswers.value = 0;
    wrongAnswers.value = 0;

    // TODO: shall i reset this also?
    userRecords.value = [];
  }

  return { score, setScore, correctAnswers, wrongAnswers, incrementCorrectAnswers, incrementWrongAnswers, incrementScore, decrementScore, updateScore, addUserRecord, getUserRecords, resetScore }
})