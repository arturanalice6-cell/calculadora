import { supabase } from './supabaseClient';

// Supabase tables - adjust table names to match your Supabase schema
export const Post = () => supabase.from('posts');
export const Story = () => supabase.from('stories');
export const Like = () => supabase.from('likes');
export const Comment = () => supabase.from('comments');
export const Follow = () => supabase.from('follows');
export const Notification = () => supabase.from('notifications');
export const StoryLike = () => supabase.from('story_likes');
export const SavedPost = () => supabase.from('saved_posts');
export const BusinessProfile = () => supabase.from('business_profiles');
export const Advertisement = () => supabase.from('advertisements');
export const WorkoutPlan = () => supabase.from('workout_plans');
export const Subscription = () => supabase.from('subscriptions');
export const Challenge = () => supabase.from('challenges');
export const ChallengeParticipant = () => supabase.from('challenge_participants');
export const ChatMessage = () => supabase.from('chat_messages');
export const WorkoutLog = () => supabase.from('workout_logs');
export const Achievement = () => supabase.from('achievements');
export const StoryView = () => supabase.from('story_views');
export const ChallengeProofSubmission = () => supabase.from('challenge_proof_submissions');
export const GymProfile = () => supabase.from('gym_profiles');
export const Community = () => supabase.from('communities');
export const CommunityMember = () => supabase.from('community_members');
export const CommunityPost = () => supabase.from('community_posts');
export const CommunityReport = () => supabase.from('community_reports');
export const InstructorStudent = () => supabase.from('instructor_students');
export const PrivateChallenge = () => supabase.from('private_challenges');

// Auth - Supabase uses supabase.auth directly
export const User = supabase.auth;
