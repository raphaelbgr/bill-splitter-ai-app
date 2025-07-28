import { GroupService } from '../lib/group-service'
import { BrazilianCulturalContextAnalyzer } from '../lib/cultural-context'

// Mock Supabase client with simpler structure
const createMockSupabase = (overrides: any = {}) => {
  const mockAuth = {
    getUser: jest.fn(() => ({
      data: { user: { id: 'test-user-id' } }
    }))
  }

  const mockFrom = jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => ({
          data: {
            id: 'test-group-id',
            name: 'Test Group',
            description: 'Test Description',
            group_type: 'casual',
            default_split_method: 'equal',
            created_by: 'test-user-id',
            currency: 'BRL',
            ai_enabled: true,
            ai_suggestions_enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          error: null
        }))
      }))
    })),
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: [
              {
                id: 'test-group-id',
                name: 'Test Group',
                group_members: []
              }
            ],
            error: null
          }))
        }))
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: null,
            error: null
          }))
        }))
      }))
    }))
  }))

  const mockChannel = jest.fn(() => ({
    on: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(() => ({
          subscribe: jest.fn()
        }))
      }))
    }))
  }))

  return {
    auth: mockAuth,
    from: mockFrom,
    channel: mockChannel,
    ...overrides
  }
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => createMockSupabase())
}))

describe('GroupService', () => {
  let groupService: GroupService

  beforeEach(() => {
    groupService = new GroupService()
  })

  describe('createGroup', () => {
    it('should create a group with Brazilian cultural context', async () => {
      const groupData = {
        name: 'Churrasco da Galera',
        description: 'Churrasco com amigos',
        group_type: 'casual' as const,
        default_split_method: 'equal' as const
      }

      const result = await groupService.createGroup(groupData)

      expect(result).toBeDefined()
      expect(result?.name).toBe('Test Group')
      expect(result?.cultural_context).toBeDefined()
    })

    it('should analyze cultural context from group name', async () => {
      const groupData = {
        name: 'Happy Hour do Trabalho',
        description: 'Happy hour com colegas'
      }

      const result = await groupService.createGroup(groupData)

      expect(result?.cultural_context).toBeDefined()
      // The cultural context should be analyzed from the name and description
    })

    it('should throw error when user is not authenticated', async () => {
      // Mock unauthenticated user
      const mockSupabase = createMockSupabase({
        auth: {
          getUser: jest.fn(() => ({
            data: { user: null }
          }))
        }
      })
      
      // Create a new GroupService instance with the mocked Supabase
      const { createClient } = require('@supabase/supabase-js')
      createClient.mockReturnValue(mockSupabase)
      
      const testGroupService = new GroupService()

      const groupData = {
        name: 'Test Group'
      }

      await expect(testGroupService.createGroup(groupData)).rejects.toThrow('Usuário não autenticado')
    })
  })

  describe('getUserGroups', () => {
    it('should return user groups with cultural context', async () => {
      // Ensure we're using the mocked Supabase client
      const { createClient } = require('@supabase/supabase-js')
      const mockSupabase = createMockSupabase()
      createClient.mockReturnValue(mockSupabase)
      
      const testGroupService = new GroupService()
      const groups = await testGroupService.getUserGroups()

      expect(Array.isArray(groups)).toBe(true)
    })

    it('should handle empty groups list', async () => {
      // Mock empty response
      const mockSupabase = createMockSupabase({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  data: [],
                  error: null
                }))
              }))
            }))
          }))
        }))
      })
      
      const { createClient } = require('@supabase/supabase-js')
      createClient.mockReturnValue(mockSupabase)

      const testGroupService = new GroupService()
      const groups = await testGroupService.getUserGroups()

      expect(groups).toEqual([])
    })
  })

  describe('getGroupSuggestions', () => {
    it('should return suggestions for churrasco context', () => {
      const suggestions = groupService.getGroupSuggestions('churrasco com amigos')

      expect(suggestions).toContain('Churrasco da Galera')
      expect(suggestions).toContain('Churrasco da Família')
      expect(suggestions).toContain('Churrasco dos Amigos')
    })

    it('should return suggestions for happy hour context', () => {
      const suggestions = groupService.getGroupSuggestions('happy hour do trabalho')

      expect(suggestions).toContain('Happy Hour do Trabalho')
      expect(suggestions).toContain('Happy Hour dos Amigos')
      expect(suggestions).toContain('Happy Hour da Faculdade')
    })

    it('should return suggestions for aniversario context', () => {
      const suggestions = groupService.getGroupSuggestions('aniversário da maria')

      expect(suggestions).toContain('Aniversário da Maria')
      expect(suggestions).toContain('Festa de Aniversário')
      expect(suggestions).toContain('Comemoração')
    })

    it('should return suggestions for viagem context', () => {
      const suggestions = groupService.getGroupSuggestions('viagem para a praia')

      expect(suggestions).toContain('Viagem para a Praia')
      expect(suggestions).toContain('Passeio da Família')
      expect(suggestions).toContain('Viagem dos Amigos')
    })

    it('should return suggestions for vaquinha context', () => {
      const suggestions = groupService.getGroupSuggestions('vaquinha do presente')

      expect(suggestions).toContain('Vaquinha do Presente')
      expect(suggestions).toContain('Coleta da Galera')
      expect(suggestions).toContain('Contribuição')
    })

    it('should return suggestions for rodizio context', () => {
      const suggestions = groupService.getGroupSuggestions('rodízio de pizza')

      expect(suggestions).toContain('Rodízio de Pizza')
      expect(suggestions).toContain('Rodízio de Churrasco')
      expect(suggestions).toContain('Rodízio da Galera')
    })

    it('should return generic suggestions for unknown context', () => {
      const suggestions = groupService.getGroupSuggestions('random text')

      expect(suggestions).toContain('Amigos do Trabalho')
      expect(suggestions).toContain('Família')
      expect(suggestions).toContain('Amigos da Faculdade')
      expect(suggestions).toContain('Viagem')
    })

    it('should return maximum 5 suggestions', () => {
      const suggestions = groupService.getGroupSuggestions('churrasco')

      expect(suggestions.length).toBeLessThanOrEqual(5)
    })
  })

  describe('subscribeToGroupUpdates', () => {
    it('should return subscription object', () => {
      const callback = jest.fn()
      const subscription = groupService.subscribeToGroupUpdates('test-group-id', callback)

      expect(subscription).toBeDefined()
      expect(typeof subscription.subscribe).toBe('function')
    })
  })
})

describe('Brazilian Cultural Context Integration', () => {
  let culturalAnalyzer: BrazilianCulturalContextAnalyzer

  beforeEach(() => {
    culturalAnalyzer = new BrazilianCulturalContextAnalyzer()
  })

  describe('Cultural Context Analysis', () => {
    it('should detect churrasco context', () => {
      const context = culturalAnalyzer.analyzeCulturalContext('churrasco com amigos')

      expect(context.scenario).toBe('churrasco')
      expect(context.confidence).toBeGreaterThan(0.8)
    })

    it('should detect happy hour context', () => {
      const context = culturalAnalyzer.analyzeCulturalContext('happy hour do trabalho')

      expect(context.scenario).toBe('happy_hour')
      expect(context.confidence).toBeGreaterThan(0.8)
    })

    it('should detect aniversario context', () => {
      const context = culturalAnalyzer.analyzeCulturalContext('aniversário da maria')

      expect(context.scenario).toBe('aniversario')
      expect(context.confidence).toBeGreaterThan(0.8)
    })

    it('should detect viagem context', () => {
      const context = culturalAnalyzer.analyzeCulturalContext('viagem para a praia')

      expect(context.scenario).toBe('viagem')
      expect(context.confidence).toBeGreaterThan(0.8)
    })

    it('should detect vaquinha context', () => {
      const context = culturalAnalyzer.analyzeCulturalContext('vaquinha do presente')

      expect(context.scenario).toBe('vaquinha')
      expect(context.confidence).toBeGreaterThan(0.8)
    })

    it('should detect rodizio context', () => {
      const context = culturalAnalyzer.analyzeCulturalContext('rodízio de pizza')

      expect(context.scenario).toBe('rodizio')
      expect(context.confidence).toBeGreaterThan(0.8)
    })
  })
}) 