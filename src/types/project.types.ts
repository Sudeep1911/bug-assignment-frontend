export interface Project {
  _id: string;
  name: string;
  description: string;

  startDate: Date;
  endDate: Date;
  modules: Modules[]
  kanbanStages: any[];
}

interface Modules{
  name: string;
  _id:string;
  projectId: string;
}