import { ref } from 'vue';
import { Variable } from '~/model/ComponentVariables';
import type { VariableType } from '~/model/types/VariableType';

const systemInputVariables = ref<Variable[]>([]);

export function useSystemInputVariables() {
  function upsertSystemInputVariable(name: string, value: VariableType) {
    const existing = systemInputVariables.value.find(variable => variable.name === name);

    if (existing) {
      if (existing.variable === value) return;
      existing.variable = value;
      return;
    }

    systemInputVariables.value.push(new Variable(name, value));
  }

  function upsertSystemComputedVariable(name: string, value: VariableType) {
    upsertSystemInputVariable(name, value);
  }

  function removeSystemInputVariable(name: string) {
    systemInputVariables.value = systemInputVariables.value.filter(variable => variable.name !== name);
  }

  function clearSystemInputVariables() {
    systemInputVariables.value = [];
  }

  return {
    systemInputVariables,
    upsertSystemInputVariable,
    upsertSystemComputedVariable,
    removeSystemInputVariable,
    clearSystemInputVariables
  };
}
