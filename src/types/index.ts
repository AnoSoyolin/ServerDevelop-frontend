export interface User {
  id: number;
  name: string;
  phone: string;
  password: string;
  tasks: Task[];
}

export interface Task {
  id: number;
  name: string;
  description: string;
  type: string;
  user: User;
  evaluations: Evaluation[];
}

export interface Evaluation {
  id: number;
  round_num: number;
  dataset: string;
  metrics: string[];
  results: string[];
  task: Task;
}

export interface UserVO {
  name: string;
  phone: string;
  password: string;
}

export interface TaskVO {
  name: string;
  description: string;
  type: string;
}

export interface EvaluationVO {
  round_num: number;
  dataset: string;
  metrics: string[];
  results: string[];
  taskId: number;
}

export interface loginInfo{
    phone: string;
    password: string
}