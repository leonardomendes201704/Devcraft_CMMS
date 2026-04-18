/** Maps known English API / ValidationProblemDetails strings to PT-BR for end users. */

const EXACT: Record<string, string> = {
  'One or more validation errors occurred.': 'Corrija os campos indicados e tente novamente.',

  'Closed tasks cannot change effort.': 'Tarefas fechadas não podem alterar horas de esforço.',
  'Closed tasks cannot change status.': 'Tarefas fechadas não podem mudar de status.',
  'Use /complete endpoint to close a task.': 'Para fechar uma tarefa, use a ação de concluir (fechar) em vez de mudar o status.',
  'Status is invalid.': 'Status inválido.',
  'Type is invalid.': 'Tipo inválido.',
  'Title is required.': 'O título é obrigatório.',
  'Task can only be completed when status is \'resolved\'.': 'Só é possível concluir a tarefa quando ela está em "resolved".',
  'Task must have spentHours greater than 0 before close.': 'Informe horas de esforço (spent) maiores que zero antes de fechar.',
  'Frontend-related task requires at least one image evidence before close.':
    'Esta tarefa exige pelo menos uma evidência em imagem antes de fechar.',
  'API-related task requires at least one API evidence with JSON payload/response before close.':
    'Esta tarefa exige pelo menos uma evidência de API com JSON antes de fechar.',

  'Kind must be either \'image\' or \'api\'.': 'O tipo da evidência deve ser "image" ou "api".',
  'ImageUrl is required for image evidence.': 'Para evidência em imagem, informe a URL da imagem.',
  'PayloadJson is required for api evidence.': 'Para evidência de API, informe o JSON do payload.',
  'PayloadJson must contain valid JSON.': 'O PayloadJson precisa ser um JSON válido.',

  'Name is required.': 'O nome é obrigatório.',
  'Code is required.': 'O código é obrigatório.',
  'Department was not found.': 'Departamento não encontrado.',
  'Name cannot be empty.': 'O nome não pode ficar vazio.',
  'Code cannot be empty.': 'O código não pode ficar vazio.',

  'Email is required.': 'O e-mail é obrigatório.',
  'Role is invalid.': 'Perfil (role) inválido.',
  'Password is invalid.': 'Senha inválida.',

  'Operation failed. Please review payload and try again.':
    'Não foi possível concluir a operação. Revise os dados e tente novamente.',
  'Operation failed. Please review task rules and try again.':
    'Não foi possível concluir a operação. Revise as regras da tarefa e tente novamente.',
}

export function mapApiMessageToPtBr(message: string): string {
  const trimmed = message.trim()
  if (!trimmed) {
    return trimmed
  }

  if (EXACT[trimmed]) {
    return EXACT[trimmed]
  }

  const transition = trimmed.match(/^Transition from '([^']+)' to '([^']+)' is not allowed\.$/)
  if (transition) {
    return `Não é permitido mudar de "${transition[1]}" para "${transition[2]}".`
  }

  const requestFailed = trimmed.match(/^Request failed \((\d+)\)$/)
  if (requestFailed) {
    return `A requisição falhou (código ${requestFailed[1]}).`
  }

  return trimmed
}
