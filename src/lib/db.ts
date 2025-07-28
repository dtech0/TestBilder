import Dexie, { Table } from 'dexie';

export interface Theme{
  id?: number;
  mode: string;
}
class AppDatabase extends Dexie{
  theme!:Table<Theme>;
  constructor(){
    super('tB-DB')
    this.version(1).stores({
      theme: 'id, mode'
    })
    this.on('populate', async()=>{
      await this.theme.add({ id:1, mode: 'dark' });
    })
  }
}
export const db = new AppDatabase();