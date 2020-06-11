import express from 'express';
import knex from '../database/connection';

class PointsController {
  async index(req: express.Request, res: express.Response) {
    const { city, uf, items } = req.query;

    const parsedItems = String(items).split(/[ ,]+/).map(Number);
    
    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    const serializedPoints = points.map(point => {
      return {
        ...point,
        image_url: `http://192.168.0.102:3333/uploads/points/${point.image}`
      }
    });

    return res.json(serializedPoints);
  }

  async show(req: express.Request, res: express.Response) {
      const { id } = req.params;

      const point = await knex('points').where('id', id).first();

      if (! point) {
        return res.status(400).json({ message: 'Point not found.' });
      }

      const items = await knex('items')
        .join('point_items', 'items.id', '=', 'point_items.item_id')
        .where('point_items.point_id', id)
        .select('items.title');

      return res.json({
        ...point,
        image_url: `http://192.168.0.102:3333/uploads/points/${point.image}`,
        items,
      });
  }
  
  async create(req: express.Request, res: express.Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = req.body;

    const point = {
      image: req.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    }
    const trx = await knex.transaction();

    const insertedIds = await trx('points').insert(point);

    const point_id = insertedIds[0];

    const pointItems = items.split(',').map(Number).map((item_id: number) => {
      return {
        item_id,
        point_id
      }
    });

    await trx('point_items').insert(pointItems);

    await trx.commit();

    return res.json({ 
      id: point_id,
      ...point
    });
  }
}

export default PointsController;