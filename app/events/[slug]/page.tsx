import Image from 'next/image';
import { notFound } from 'next/navigation';
import BookEvent from '@/components/BookEvent';
import { IEvent } from '@/database';
import { getSimilarEventsBySlug } from '@/lib/actions/event.action';
import EventCard from '@/components/EventCard';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailItem = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => (
  <div className='flex-row-gap-2 items-center '>
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agenda }: { agenda: string[] }) => (
  <div className='agenda'>
    <h2>Agenda</h2>
    <ul className='flex-col-gap-1'>
      {agenda.map((item) => (
        <li key={item} className='flex-row-gap-2 items-center'>
          {/* <Image
            src='/icons/agenda.svg'
            alt='Agenda Icon'
            width={17}
            height={17}
          /> */}
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className='flex flex-row gap-1.5 flex-wrap'>
    {tags.map((tag) => (
      <div key={tag} className='pill'>
        {tag}
      </div>
    ))}
  </div>
);

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  let event;
  try {
    const request = await fetch(`${BASE_URL}/api/events/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!request.ok) {
      if (request.status === 404) {
        return notFound();
      }
      throw new Error(`Failed to fetch event data: ${request.statusText}`);
    }

    const response = await request.json();
    event = response.event;
  } catch (error) {
    console.error('Error fetching event data:', error);
    return notFound();
  }

  const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

  const {
    description,
    image,
    overview,
    date,
    time,
    location,
    mode,
    agenda,
    audience,
    organizer,
    tags,
  } = event;

  if (!description) return notFound();

  const bookings = 10;

  return (
    <section id='event'>
      <div className='header'>
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>
      <div className='details'>
        <div className='content'>
          <Image
            src={image}
            alt='Event Banner'
            width={800}
            height={800}
            className='banner'
          />
          <section className='flex-col-gap-2'>
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className='flex-col-gap-2'>
            <h2>Event Details</h2>
            <EventDetailItem
              icon='/icons/calendar.svg'
              alt='Calendar Icon'
              label={date}
            />
            <EventDetailItem
              icon='/icons/clock.svg'
              alt='Clock Icon'
              label={time}
            />
            <EventDetailItem
              icon='/icons/pin.svg'
              alt='Location Icon'
              label={location}
            />
            <EventDetailItem
              icon='/icons/mode.svg'
              alt='Mode Icon'
              label={mode}
            />
            <EventDetailItem
              icon='/icons/audience.svg'
              alt='Audience Icon'
              label={audience}
            />
          </section>
          <EventAgenda agenda={agenda} />

          <section className='flex-col-gap-2'>
            <h2>About The Organizer</h2>
            <p>{organizer}</p>
          </section>
          <EventTags tags={tags} />
        </div>
        <aside className='booking'>
          <div className='signup-card'>
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className='text-sm'>
                Join {bookings} people who have already booked their spot
              </p>
            ) : (
              <p className='text-sm'>Be the first to book your spot</p>
            )}

            <BookEvent />
          </div>
        </aside>
      </div>

      <div className='flex w-full flex-col gap-4 pt-20'>
        <h2>Similar Events</h2>
        <div className='events'>
          {similarEvents.length > 0 &&
            similarEvents.map((similarEvent: IEvent) => (
              <EventCard {...similarEvent} key={similarEvent.id} />
            ))}
        </div>
      </div>
    </section>
  );
};
export default EventDetailsPage;
