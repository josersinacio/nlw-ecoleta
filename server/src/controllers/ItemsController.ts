import express from 'express';
import knex from '../database/connection';

class ItemsController {

  async index(req: express.Request, res: express.Response) {
    const items = await knex('items').select('*');

    const serializedItems = items.map(item => {
      return {
        id: item.id,
        title: item.title,
        image_url: `http://192.168.0.102:3333/uploads/${item.image}`
      };
    });

    return res.json(serializedItems);
  }
}

export default ItemsController;
