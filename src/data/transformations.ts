
export interface Transformation {
  id: number;
  before: string;
  after: string;
  title: string;
  master: string;
  description: string;
}

/**
 * ГАЛЕРЕЯ ТРАНСФОРМАЦИЙ (ДО И ПОСЛЕ)
 * 
 * Чтобы изменить фотографии:
 * 1. Замените ссылки в 'before' (До) и 'after' (После).
 * 2. Вы можете добавить новые объекты в этот список.
 * 3. 'title' - название стиля, 'master' - имя мастера.
 */
export const transformations: Transformation[] = [
  {
    id: 1,
    before: "https://images.unsplash.com/photo-1599351431247-f10b21ce49b3?auto=format&fit=crop&q=80&w=800", // Длинные волосы (До)
    after: "https://images.unsplash.com/photo-1621605815841-2dddb7f980a9?auto=format&fit=crop&q=80&w=800", // Стильная стрижка (После)
    title: "Total Transformation",
    master: "AMMOR",
    description: "Полное преображение из длинных волос в стильный современный образ."
  },
  {
    id: 2,
    before: "https://images.unsplash.com/photo-1621605815841-2dddb7f980a9?auto=format&fit=crop&q=80&w=800",
    after: "https://images.unsplash.com/photo-1621605815841-2dddb7f980a9?auto=format&fit=crop&q=80&w=800", // Замените на реальное фото ПОСЛЕ
    title: "Modern Fade",
    master: "AMMOR",
    description: "Современный фейд с четкими линиями окантовки."
  },
  {
    id: 3,
    before: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800",
    after: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800", // Замените на реальное фото ПОСЛЕ
    title: "Premium Look",
    master: "AMMOR",
    description: "Полное преображение образа и уход за бородой."
  }
];
