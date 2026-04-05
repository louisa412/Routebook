import type { HotelInfo, TripEvent } from '../types'

export const getEventLocationSource = (event: Pick<TripEvent, 'locationSource'>): 'manual' | 'lodging' => {
  return event.locationSource === 'lodging' ? 'lodging' : 'manual'
}

export const resolveEventLocation = (
  event: Pick<TripEvent, 'location' | 'locationSource' | 'day'>,
  lodgingByDay: Record<number, HotelInfo>
): string => {
  const source = getEventLocationSource(event)
  if (source === 'lodging') {
    const hotel = lodgingByDay[event.day]
    if (hotel) {
      return [hotel.name, hotel.address].filter(Boolean).join(' · ')
    }
  }
  return event.location || ''
}
