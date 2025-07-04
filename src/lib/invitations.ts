import { getSupabase } from '../lib/supabase';
import type { Database } from './database.types';

type Guest = Database['public']['Tables']['guests']['Row'];
type Invitation = Database['public']['Tables']['invitations']['Row'] & {
  guests: Guest[];
};

const supabase = getSupabase();

export async function getInvitation(invitationId: string): Promise<Invitation | null> {
  const { data: invitation, error: invitationError } = await supabase
    .from('invitations')
    .select('*')
    .eq('id', invitationId)
    .single();

  if (invitationError || !invitation) {
    console.error('Error fetching invitation:', invitationError);
    return null;
  }

  const { data: guests, error: guestsError } = await supabase
    .from('guests')
    .select('*')
    .eq('invitation_id', invitationId);

  if (guestsError) {
    console.error('Error fetching guests:', guestsError);
    return null;
  }

  return {
    ...invitation,
    guests: guests || [],
  };
}

export async function updateGuestRSVP(
  guestId: string,
  rsvp: boolean
): Promise<boolean> {
  const updateData: Database['public']['Tables']['guests']['Update'] = {
    rsvp,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('guests')
    .update(updateData)
    .eq('id', guestId);

  if (error) {
    console.error('Error updating guest RSVP:', error);
    return false;
  }

  return true;
}

export async function createInvitation(
  title: string,
  isSpecialInvitation: boolean,
  deadline: string,
  guestNames: string[]
): Promise<string | null> {
  const { data: invitation, error: invitationError } = await supabase
    .from('invitations')
    .insert({ 
      title,
      is_special_invitation: isSpecialInvitation,
      deadline: deadline,
    })
    .select()
    .single();

  if (invitationError || !invitation) {
    console.error('Error creating invitation:', invitationError);
    return null;
  }

  const { error: guestsError } = await supabase.from('guests').insert(
    guestNames.map((name) => ({
      invitation_id: invitation.id,
      name,
      rsvp: null,
      menu: null,
    }))
  );

  if (guestsError) {
    console.error('Error creating guests:', guestsError);
    // Clean up the invitation if guest creation fails
    await supabase.from('invitations').delete().eq('id', invitation.id);
    return null;
  }

  return invitation.id;
} 