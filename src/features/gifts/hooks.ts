import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { giftApi, getCurrentUser, collectionsApi } from '../../lib/directus'
import type { Gift, Event, Contribution, UserInfo } from './types'

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

// Hook para obtener la lista de regalos
export const useGifts = (params: {
  search?: string
  status?: string
  limit?: number
  offset?: number
} = {}) => {
  return useQuery<Gift[]>({
    queryKey: ['gifts', params],
    queryFn: async () => {
      console.log('Intentando obtener regalos con params:', params)
      const response = await giftApi.getGifts(params)
      console.log('Respuesta de Directus:', response)
      return response.data || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: (failureCount, error) => {
      console.error(`Error fetching gifts (attempt ${failureCount + 1}):`, error)
      return failureCount < 2 // Retry up to 2 times
    },
  })
}

// Hook para obtener un regalo específico
export const useGift = (id: number) => {
  return useQuery<Gift>({
    queryKey: ['gift', id],
    queryFn: async () => {
      console.log(`Intentando obtener regalo con id: ${id}`)
      const response = await giftApi.getGift(id)
      console.log(`Respuesta de Directus para regalo ${id}:`, response)
      return response.data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: (failureCount, error) => {
      console.error(`Error fetching gift ${id} (attempt ${failureCount + 1}):`, error)
      return failureCount < 2 // Retry up to 2 times
    },
  })
}

// Hook para obtener eventos de un regalo
export const useGiftEvents = (giftId: number) => {
  return useQuery<Event[]>({
    queryKey: ['giftEvents', giftId],
    queryFn: async () => {
      console.log(`Intentando obtener eventos para regalo: ${giftId}`)
      const response = await giftApi.getEvents(giftId)
      console.log(`Respuesta de Directus para eventos ${giftId}:`, response)
      return response.data || []
    },
    enabled: !!giftId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: (failureCount, error) => {
      console.error(`Error fetching gift events ${giftId} (attempt ${failureCount + 1}):`, error)
      return failureCount < 2 // Retry up to 2 times
    },
  })
}

// Hook para obtener contribuciones de un regalo
export const useGiftContributions = (giftId: number) => {
  return useQuery<Contribution[]>({
    queryKey: ['giftContributions', giftId],
    queryFn: async () => {
      console.log(`Intentando obtener contribuciones para regalo: ${giftId}`)
      const response = await giftApi.getContributions(giftId)
      console.log(`Respuesta de Directus para contribuciones ${giftId}:`, response)
      return response.data || []
    },
    enabled: !!giftId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: (failureCount, error) => {
      console.error(`Error fetching gift contributions ${giftId} (attempt ${failureCount + 1}):`, error)
      return failureCount < 2 // Retry up to 2 times
    },
  })
}

// Hook para crear un regalo
export const useCreateGift = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (_giftData: Partial<Gift>) => {
      return await giftApi.createGift(_giftData)
    },
    onSuccess: () => {
      // Invalidar la caché de regalos para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['gifts'] })
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
      queryClient.invalidateQueries({ queryKey: ['gifts'] })
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
      queryClient.invalidateQueries({ queryKey: ['gifts'] })
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
      queryClient.invalidateQueries({ queryKey: ['giftEvents'] })
    },
  })
}

// Hook para crear una contribución
export const useCreateContribution = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (_contributionData: Partial<Contribution>) => {
      // Esta función se implementará cuando se agregue el endpoint de creación
      throw new Error('Create contribution not implemented yet')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftContributions'] })
    },
  })
}