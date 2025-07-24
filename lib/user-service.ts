import { supabase } from './supabase-pages'
import { BrazilianUserProfile } from './supabase-pages'

export class UserService {
  private supabase = supabase

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<BrazilianUserProfile | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    const { data: profile, error: profileError } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return null
    }

    return profile
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<BrazilianUserProfile>): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { error } = await this.supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
      return false
    }

    return true
  }

  /**
   * Update user consent preferences
   */
  async updateConsent(consentType: string, granted: boolean): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Update user profile consent
    const { error: profileError } = await this.supabase
      .from('user_profiles')
      .update({
        [`${consentType}_consent`]: granted,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Error updating consent in profile:', profileError)
      return false
    }

    // Create consent record
    const { error: consentError } = await this.supabase
      .from('consent_records')
      .insert({
        user_id: user.id,
        consent_type: consentType,
        consent_granted: granted,
        consent_version: '2024.1',
        purpose: this.getConsentPurpose(consentType),
        legal_basis: granted ? 'Consentimento' : 'Retirada de consentimento',
        expires_at: granted ? 
          new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString() : 
          new Date().toISOString()
      })

    if (consentError) {
      console.error('Error creating consent record:', consentError)
      return false
    }

    return true
  }

  /**
   * Export user data (LGPD right to data portability)
   */
  async exportUserData(): Promise<any> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Get user profile
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get user conversations
    const { data: conversations } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)

    // Get user groups
    const { data: groups } = await this.supabase
      .from('group_members')
      .select(`
        *,
        groups (*)
      `)
      .eq('user_id', user.id)

    // Get consent records
    const { data: consents } = await this.supabase
      .from('consent_records')
      .select('*')
      .eq('user_id', user.id)

    return {
      exported_at: new Date().toISOString(),
      user_profile: profile,
      conversations: conversations || [],
      groups: groups || [],
      consent_records: consents || []
    }
  }

  /**
   * Delete user account (LGPD right to be forgotten)
   */
  async deleteAccount(reason?: string): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Soft delete user profile
    const { error: profileError } = await this.supabase
      .from('user_profiles')
      .update({
        deleted_at: new Date().toISOString(),
        deletion_reason: reason || 'User requested deletion',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Error soft deleting profile:', profileError)
      return false
    }

    // Create data access log entry
    const { error: logError } = await this.supabase
      .from('data_access_log')
      .insert({
        user_id: user.id,
        operation_type: 'delete',
        data_categories: ['user_profile', 'conversations', 'groups'],
        legal_basis: 'Direito ao esquecimento (LGPD)',
        purpose: 'Exclusão de conta solicitada pelo usuário'
      })

    if (logError) {
      console.error('Error creating access log:', logError)
    }

    // Delete user from Supabase Auth
    const { error: authError } = await this.supabase.auth.admin.deleteUser(user.id)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      return false
    }

    return true
  }

  /**
   * Get user's groups
   */
  async getUserGroups(): Promise<any[]> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      return []
    }

    const { data: groups, error } = await this.supabase
      .from('group_members')
      .select(`
        *,
        groups (*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching user groups:', error)
      return []
    }

    return groups || []
  }

  /**
   * Create a new group
   */
  async createGroup(groupData: {
    name: string
    description?: string
    group_type?: string
    default_split_method?: string
  }): Promise<string | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data: group, error } = await this.supabase
      .from('groups')
      .insert({
        ...groupData,
        created_by: user.id,
        currency: 'BRL',
        ai_enabled: true,
        ai_suggestions_enabled: true
      })
      .select('id')
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

    return group.id
  }

  /**
   * Get consent purpose description
   */
  private getConsentPurpose(consentType: string): string {
    const purposes = {
      marketing: 'Envio de comunicações de marketing sobre novos recursos e funcionalidades',
      ai_processing: 'Processamento de IA para assistência em divisão de contas e conversas',
      analytics: 'Análise de uso para melhorar a experiência do usuário',
      data_retention: 'Retenção de dados para funcionalidade do aplicativo'
    }

    return purposes[consentType as keyof typeof purposes] || 'Processamento de dados'
  }

  /**
   * Check if user has required consent for AI processing
   */
  async hasAIConsent(): Promise<boolean> {
    const profile = await this.getCurrentUser()
    return profile?.ai_processing_consent || false
  }

  /**
   * Update user's last active timestamp
   */
  async updateLastActive(): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) return

    await this.supabase
      .from('user_profiles')
      .update({
        last_active_at: new Date().toISOString()
      })
      .eq('id', user.id)
  }
} 