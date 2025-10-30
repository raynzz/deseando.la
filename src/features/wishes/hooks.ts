import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wishApi, getCurrentUser } from '../../lib/directus'
import { mockWishes, mockEvents, mockGifts } from '../../lib/mockData'
import type { Wish, Event, Gift, UserInfo } from './types'

// Hook para obtener la información del usuario actual
export const useCurrentUser = () => {
  return useQuery<UserInfo | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        console.log('Intentando obtener usuario actual...')
        const user = await getCurrentUser()
        console.log('Usuario obtenido:', user)
        return user
      } catch (error) {
        console.error('Error getting current user:', error)
        return null
      }
    },
    retry: false,
  })
}

// Hook para obtener la lista de deseos
export const useWishes = (params: {
  search?: string
  status?: string
  limit?: number
  offset?: number
} = {}) => {
  return useQuery<Wish[]>({
    queryKey: ['wishes', params],
    queryFn: async () => {
      try {
        console.log('Intentando obtener deseos con params:', params)
        const response = await wishApi.getWishes(params)
        console.log('Respuesta de Directus:', response)
        return response.data || []
      } catch (error) {
        console.error('Error fetching wishes, using mock data:', error)
        // Filtrar datos de prueba según los parámetros
        let filteredWishes = [...mockWishes]
        
        if (params.search) {
          const searchLower = params.search.toLowerCase()
          filteredWishes = filteredWishes.filter(wish => 
            wish.title.toLowerCase().includes(searchLower) ||
            (wish.description && wish.description.toLowerCase().includes(searchLower))
          )
        }
        
        if (params.status) {
          filteredWishes = filteredWishes.filter(wish => wish.status === params.status)
        }
        
        if (params.limit) {
          filteredWishes = filteredWishes.slice(0, params.limit)
        }
        
        console.log('Usando datos de prueba:', filteredWishes)
        return filteredWishes
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para obtener un deseo específico
export const useWish = (id: number) => {
  return useQuery<Wish>({
    queryKey: ['wish', id],
    queryFn: async () => {
      try {
        console.log(`Intentando obtener deseo con id: ${id}`)
        const response = await wishApi.getWish(id)
        console.log(`Respuesta de Directus para deseo ${id}:`, response)
        return response.data
      } catch (error) {
        console.error(`Error fetching wish ${id}, using mock data:`, error)
        const wish = mockWishes.find(w => w.id === id)
        if (!wish) {
          throw new Error('Wish not found')
        }
        return wish
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para obtener eventos de un deseo
export const useWishEvents = (wishId: number) => {
  return useQuery<Event[]>({
    queryKey: ['wishEvents', wishId],
    queryFn: async () => {
      try {
        console.log(`Intentando obtener eventos para deseo: ${wishId}`)
        const response = await wishApi.getEvents(wishId)
        console.log(`Respuesta de Directus para eventos ${wishId}:`, response)
        return response.data || []
      } catch (error) {
        console.error(`Error fetching wish events ${wishId}, using mock data:`, error)
        return mockEvents.filter(event => event.wish === wishId)
      }
    },
    enabled: !!wishId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para obtener regalos de un deseo
export const useWishGifts = (wishId: number) => {
  return useQuery<Gift[]>({
    queryKey: ['wishGifts', wishId],
    queryFn: async () => {
      try {
        console.log(`Intentando obtener regalos para deseo: ${wishId}`)
        const response = await wishApi.getGifts(wishId)
        console.log(`Respuesta de Directus para regalos ${wishId}:`, response)
        return response.data || []
      } catch (error) {
        console.error(`Error fetching wish gifts ${wishId}, using mock data:`, error)
        return mockGifts.filter(gift => gift.wish === wishId)
      }
    },
    enabled: !!wishId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para crear un deseo
export const useCreateWish = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (wishData: Partial<Wish>) => {
      return await wishApi.createWish(wishData)
    },
    onSuccess: () => {
      // Invalidar la caché de deseos para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['wishes'] })
    },
  })
}

// Hook para actualizar un deseo
export const useUpdateWish = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...wishData }: Partial<Wish> & { id: number }) => {
      // Esta función se implementará cuando se agregue el endpoint de actualización
      throw new Error('Update wish not implemented yet')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishes'] })
    },
  })
}

// Hook para eliminar un deseo
export const useDeleteWish = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      // Esta función se implementará cuando se agregue el endpoint de eliminación
      throw new Error('Delete wish not implemented yet')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishes'] })
    },
  })
}

// Hook para crear un evento
export const useCreateEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (eventData: Partial<Event>) => {
      // Esta función se implementará cuando se agregue el endpoint de creación
      throw new Error('Create event not implemented yet')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishEvents'] })
    },
  })
}

// Hook para crear un regalo
export const useCreateGift = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (giftData: Partial<Gift>) => {
      // Esta función se implementará cuando se agregue el endpoint de creación
      throw new Error('Create gift not implemented yet')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishGifts'] })
    },
  })
}

// Hook para actualizar un regalo
export const useUpdateGift = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...giftData }: Partial<Gift> & { id: number }) => {
      // Esta función se implementará cuando se agregue el endpoint de actualización
      throw new Error('Update gift not implemented yet')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishGifts'] })
    },
  })
}

// Hook para eliminar un regalo
export const useDeleteGift = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      // Esta función se implementará cuando se agregue el endpoint de eliminación
      throw new Error('Delete gift not implemented yet')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishGifts'] })
    },
  })
}