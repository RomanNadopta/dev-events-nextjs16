'use server';

import Event from '@/database/event.model';
import connectDB from '@/lib/mongodb';

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await connectDB();
    const event = await Event.findOne({ slug });

    const similarEvents = await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    }).lean();

    return similarEvents.map((doc) => ({
      ...doc,
      _id: doc._id.toString(), // Конвертуємо в рядок, щоб Next.js не сварився
      createdAt: doc.createdAt?.toISOString(), // Дати теж треба серіалізувати
      updatedAt: doc.updatedAt?.toISOString(),
    }));

    //  return await Event.find({
    //    _id: { $ne: event._id },
    //    tags: { $in: event.tags },
    //  }).lean();
  } catch {
    return [];
  }
};
