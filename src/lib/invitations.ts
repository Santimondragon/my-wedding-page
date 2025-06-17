import { supabase } from './supabase';
import type { Database } from './database.types';

type Guest = Database['public']['Tables']['guests']['Row'];
type Invitation = Database['public']['Tables']['invitations']['Row'] & {
  guests: Guest[];
};

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
  rsvp: boolean,
  menu?: 1 | 2 | 3
): Promise<boolean> {
  const updateData: Database['public']['Tables']['guests']['Update'] = {
    rsvp,
    updated_at: new Date().toISOString()
  };

  // Only include menu if attending
  if (rsvp) {
    updateData.menu = menu;
  } else {
    updateData.menu = null; // Clear menu choice if not attending
  }

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

export async function createInvitation(guests: { name: string; is_special_guest: boolean }[]): Promise<string | null> {
  const { data: invitation, error: invitationError } = await supabase
    .from('invitations')
    .insert({})
    .select()
    .single();

  if (invitationError || !invitation) {
    console.error('Error creating invitation:', invitationError);
    return null;
  }

  const { error: guestsError } = await supabase.from('guests').insert(
    guests.map((guest) => ({
      invitation_id: invitation.id,
      ...guest,
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