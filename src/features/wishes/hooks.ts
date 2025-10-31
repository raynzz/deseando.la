import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wishApi, getCurrentUser, collectionsApi } from '../../lib/directus'
import type { Wish, Event, Gift, UserInfo } from './types'

// Hook para obtener colecciones
export const useCollections = () => {
  return useQuery<any[]>({
    queryKey: ['collections'],
    queryFn: async () => {
      console.log('Intentando obtener colecciones...')
      const response = await collectionsApi.getCollections()
      console.log('Respuesta de colecciones:', response)
      return response.data || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: (failureCount, error) => {
      console.error(`Error fetching collections (attempt ${failureCount + 1}):`, error)
      return failureCount < 2 // Retry up to 2 times
    },
  })
}

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
      console.log('Intentando obtener deseos con params:', params)
      const response = await wishApi.getWishes(params)
      console.log('Respuesta de Directus:', response)
      return response.data || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: (failureCount, error) => {
      console.error(`Error fetching wishes (attempt ${failureCount + 1}):`, error)
      return failureCount < 2 // Retry up to 2 times
    },
  })
}

// Hook para obtener un deseo específico
export const useWish = (id: number) => {
  return useQuery<Wish>({
    queryKey: ['wish', id],
    queryFn: async () => {
      console.log(`Intentando obtener deseo con id: ${id}`)
      const response = await wishApi.getWish(id)
      console.log(`Respuesta de Directus para deseo ${id}:`, response)
      return response.data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: (failureCount, error) => {
      console.error(`Error fetching wish ${id} (attempt ${failureCount + 1}):`, error)
      return failureCount < 2 // Retry up to 2 times
    },
  })
}

// Hook para obtener eventos de un deseo
export const useWishEvents = (wishId: number) => {
  return useQuery<Event[]>({
    queryKey: ['wishEvents', wishId],
    queryFn: async () => {
      console.log(`Intentando obtener eventos para deseo: ${wishId}`)
      const response = await wishApi.getEvents(wishId)
      console.log(`Respuesta de Directus para eventos ${wishId}:`, response)
      return response.data || []
    },
    enabled: !!wishId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: (failureCount, error) => {
      console.error(`Error fetching wish events ${wishId} (attempt ${failureCount + 1}):`, error)
      return failureCount < 2 // Retry up to 2 times
    },
  })
}

// Hook para obtener regalos de un deseo
export const useWishGifts = (wishId: number) => {
  return useQuery<Gift[]>({
    queryKey: ['wishGifts', wishId],
    queryFn: async () => {
      console.log(`Intentando obtener regalos para deseo: ${wishId}`)
      const response = await wishApi.getGifts(wishId)
      console.log(`Respuesta de Directus para regalos ${wishId}:`, response)
      return response.data || []
    },
    enabled: !!wishId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: (failureCount, error) => {
      console.error(`Error fetching wish gifts ${wishId} (attempt ${failureCount + 1}):`, error)
      return failureCount < 2 // Retry up to 2 times
    },
  })
}

// Hook para crear un deseo
export const useCreateWish = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (_wishData: Partial<Wish>) => {
      return await wishApi.createWish(_wishData)
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
    mutationFn: async ({ id, ..._wishData }: Partial<Wish> & { id: number }) => {
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
    mutationFn: async (_eventData: Partial<Event>) => {
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
    mutationFn: async (_giftData: Partial<Gift>) => {
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
    mutationFn: async ({ id, ..._giftData }: Partial<Gift> & { id: number }) => {
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
    mutationFn: async (_id: number) => {
      // Esta función se implementará cuando se agregue el endpoint de eliminación
      throw new Error('Delete gift not implemented yet')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishGifts'] })
    },
  })
}