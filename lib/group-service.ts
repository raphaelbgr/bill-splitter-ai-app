import { createClient } from '@supabase/supabase-js'
import { BrazilianCulturalContextAnalyzer, BrazilianCulturalContext } from './cultural-context'

// Types for group management
export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: 'admin' | 'member' | 'guest'
  status: 'active' | 'inactive' | 'blocked'
  preferred_payment_method?: string
  pix_key?: string
  joined_at: string
  updated_at: string
}

export interface GroupWithContext {
  id: string
  name: string
  description?: string
  group_type: 'casual' | 'recurring' | 'event' | 'travel'
  default_split_method: 'equal' | 'weighted' | 'custom'
  currency: string
  created_by: string
  status: 'active' | 'archived' | 'deleted'
  ai_enabled: boolean
  ai_suggestions_enabled: boolean
  cultural_context?: BrazilianCulturalContext
  created_at: string
  updated_at: string
  archived_at?: string
  members?: GroupMember[]
}

export interface CreateGroupData {
  name: string
  description?: string
  group_type?: 'casual' | 'recurring' | 'event' | 'travel'
  default_split_method?: 'equal' | 'weighted' | 'custom'
  cultural_context?: BrazilianCulturalContext
}

export interface GroupUpdateData {
  name?: string
  description?: string
  group_type?: 'casual' | 'recurring' | 'event' | 'travel'
  default_split_method?: 'equal' | 'weighted' | 'custom'
  cultural_context?: BrazilianCulturalContext
}

export class GroupService {
  private supabase
  private culturalAnalyzer: BrazilianCulturalContextAnalyzer

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    this.culturalAnalyzer = new BrazilianCulturalContextAnalyzer()
  }

  /**
   * Create a new group with Brazilian cultural context
   */
  async createGroup(groupData: CreateGroupData): Promise<GroupWithContext | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Analyze cultural context from group name and description
    const culturalContext = groupData.cultural_context || 
      this.culturalAnalyzer.analyzeCulturalContext(
        `${groupData.name} ${groupData.description || ''}`
      )

    const { data: group, error } = await this.supabase
      .from('groups')
      .insert({
        name: groupData.name,
        description: groupData.description,
        group_type: groupData.group_type || 'casual',
        default_split_method: groupData.default_split_method || 'equal',
        created_by: user.id,
        currency: 'BRL',
        ai_enabled: true,
        ai_suggestions_enabled: true,
        cultural_context: culturalContext
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating group:', error)
      return null
    }

    // Add creator as admin member
    const { error: memberError } = await this.supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: 'admin',
        status: 'active'
      })

    if (memberError) {
      console.error('Error adding user to group:', memberError)
    }

    return {
      ...group,
      cultural_context: culturalContext,
      members: [{
        id: '',
        group_id: group.id,
        user_id: user.id,
        role: 'admin',
        status: 'active',
        joined_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]
    }
  }

  /**
   * Get user's groups with cultural context
   */
  async getUserGroups(): Promise<GroupWithContext[]> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data: groups, error } = await this.supabase
      .from('groups')
      .select(`
        *,
        group_members!inner(*)
      `)
      .eq('group_members.user_id', user.id)
      .eq('group_members.status', 'active')
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching user groups:', error)
      return []
    }

    return groups.map(group => ({
      ...group,
      cultural_context: group.cultural_context || undefined
    }))
  }

  /**
   * Get group details with members and cultural context
   */
  async getGroup(groupId: string): Promise<GroupWithContext | null> {
    const { data: group, error } = await this.supabase
      .from('groups')
      .select(`
        *,
        group_members(*)
      `)
      .eq('id', groupId)
      .single()

    if (error) {
      console.error('Error fetching group:', error)
      return null
    }

    return {
      ...group,
      cultural_context: group.cultural_context || undefined,
      members: group.group_members || []
    }
  }

  /**
   * Update group with cultural context
   */
  async updateGroup(groupId: string, updateData: GroupUpdateData): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Check if user is admin of the group
    const { data: membership } = await this.supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership || membership.role !== 'admin') {
      throw new Error('Apenas administradores podem editar grupos')
    }

    const { error } = await this.supabase
      .from('groups')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', groupId)

    if (error) {
      console.error('Error updating group:', error)
      return false
    }

    return true
  }

  /**
   * Add member to group with Brazilian payment preferences
   */
  async addMember(groupId: string, userId: string, role: 'admin' | 'member' | 'guest' = 'member'): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Check if current user is admin
    const { data: membership } = await this.supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership || membership.role !== 'admin') {
      throw new Error('Apenas administradores podem adicionar membros')
    }

    const { error } = await this.supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        role,
        status: 'active'
      })

    if (error) {
      console.error('Error adding member:', error)
      return false
    }

    return true
  }

  /**
   * Remove member from group
   */
  async removeMember(groupId: string, userId: string): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Check if current user is admin
    const { data: membership } = await this.supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership || membership.role !== 'admin') {
      throw new Error('Apenas administradores podem remover membros')
    }

    const { error } = await this.supabase
      .from('group_members')
      .update({
        status: 'blocked',
        updated_at: new Date().toISOString()
      })
      .eq('group_id', groupId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error removing member:', error)
      return false
    }

    return true
  }

  /**
   * Update member payment preferences
   */
  async updateMemberPreferences(
    groupId: string, 
    userId: string, 
    preferences: {
      preferred_payment_method?: string
      pix_key?: string
    }
  ): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Users can only update their own preferences
    if (user.id !== userId) {
      throw new Error('Usuários só podem atualizar suas próprias preferências')
    }

    const { error } = await this.supabase
      .from('group_members')
      .update({
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .eq('group_id', groupId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating member preferences:', error)
      return false
    }

    return true
  }

  /**
   * Subscribe to real-time group updates
   */
  subscribeToGroupUpdates(groupId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`group:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_members',
          filter: `group_id=eq.${groupId}`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'groups',
          filter: `id=eq.${groupId}`
        },
        callback
      )
      .subscribe()
  }

  /**
   * Get group suggestions based on Brazilian cultural patterns
   */
  getGroupSuggestions(context: string): string[] {
    const culturalContext = this.culturalAnalyzer.analyzeCulturalContext(context)
    
    const suggestions: string[] = []
    
    // Suggest group names based on cultural context
    if (culturalContext.scenario === 'churrasco') {
      suggestions.push('Churrasco da Galera', 'Churrasco da Família', 'Churrasco dos Amigos')
    } else if (culturalContext.scenario === 'happy_hour') {
      suggestions.push('Happy Hour do Trabalho', 'Happy Hour dos Amigos', 'Happy Hour da Faculdade')
    } else if (culturalContext.scenario === 'aniversario') {
      suggestions.push('Aniversário da Maria', 'Festa de Aniversário', 'Comemoração')
    } else if (culturalContext.scenario === 'viagem') {
      suggestions.push('Viagem para a Praia', 'Passeio da Família', 'Viagem dos Amigos')
    } else if (culturalContext.scenario === 'vaquinha') {
      suggestions.push('Vaquinha do Presente', 'Coleta da Galera', 'Contribuição')
    } else if (culturalContext.scenario === 'rodizio') {
      suggestions.push('Rodízio de Pizza', 'Rodízio de Churrasco', 'Rodízio da Galera')
    }

    // Add generic suggestions
    suggestions.push('Amigos do Trabalho', 'Família', 'Amigos da Faculdade', 'Viagem')

    return suggestions.slice(0, 5) // Return top 5 suggestions
  }

  /**
   * Archive group (soft delete)
   */
  async archiveGroup(groupId: string): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Check if user is admin
    const { data: membership } = await this.supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership || membership.role !== 'admin') {
      throw new Error('Apenas administradores podem arquivar grupos')
    }

    const { error } = await this.supabase
      .from('groups')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', groupId)

    if (error) {
      console.error('Error archiving group:', error)
      return false
    }

    return true
  }
} 