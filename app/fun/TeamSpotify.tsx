// TeamSpotify.tsx - Shared Music Experience for Teams
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {GlassCard} from '../components/glassmorphism/GlassCard';
import {MetrTheme} from '../theme/metrTheme';
import LinearGradient from 'react-native-linear-gradient';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  albumArt: string;
  addedBy: string;
  votes: number;
  isPlaying?: boolean;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
  createdBy: string;
  collaborators: string[];
  genre?: string;
  mood?: 'focus' | 'energetic' | 'chill' | 'creative' | 'meeting';
}

interface ListeningSession {
  id: string;
  playlist: Playlist;
  participants: string[];
  currentTrack: Track | null;
  startTime: Date;
  syncEnabled: boolean;
}

export const TeamSpotify: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<ListeningSession | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([
    {
      id: '1',
      name: 'Deep Focus Flow',
      description: 'Perfect for deep work sessions',
      tracks: [
        {
          id: '1',
          title: 'Weightless',
          artist: 'Marconi Union',
          album: 'Weightless',
          duration: 480,
          albumArt: 'https://picsum.photos/200',
          addedBy: 'Alex',
          votes: 12,
        },
        {
          id: '2',
          title: 'Clair de Lune',
          artist: 'Claude Debussy',
          album: 'Suite Bergamasque',
          duration: 300,
          albumArt: 'https://picsum.photos/201',
          addedBy: 'Sarah',
          votes: 8,
        },
      ],
      createdBy: 'Team Lead',
      collaborators: ['Alex', 'Sarah', 'Mike'],
      mood: 'focus',
    },
    {
      id: '2',
      name: 'Friday Vibes',
      description: 'End the week on a high note',
      tracks: [
        {
          id: '3',
          title: 'Good as Hell',
          artist: 'Lizzo',
          album: 'Cuz I Love You',
          duration: 220,
          albumArt: 'https://picsum.photos/202',
          addedBy: 'Mike',
          votes: 15,
        },
      ],
      createdBy: 'HR Team',
      collaborators: ['Everyone'],
      mood: 'energetic',
    },
  ]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackProgress, setCurrentTrackProgress] = useState(0);
  const [volume, setVolume] = useState(70);

  useEffect(() => {
    if (isPlaying && currentSession?.currentTrack) {
      const interval = setInterval(() => {
        setCurrentTrackProgress(prev => {
          if (prev >= currentSession.currentTrack!.duration) {
            playNextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentSession]);

  const startListeningSession = (playlist: Playlist) => {
    const session: ListeningSession = {
      id: `session_${Date.now()}`,
      playlist,
      participants: ['You', 'Alex', 'Sarah', 'Mike'],
      currentTrack: playlist.tracks[0] || null,
      startTime: new Date(),
      syncEnabled: true,
    };
    
    setCurrentSession(session);
    setIsPlaying(true);
  };

  const playNextTrack = () => {
    if (!currentSession) return;
    
    const currentIndex = currentSession.playlist.tracks.findIndex(
      t => t.id === currentSession.currentTrack?.id
    );
    
    const nextIndex = (currentIndex + 1) % currentSession.playlist.tracks.length;
    const nextTrack = currentSession.playlist.tracks[nextIndex];
    
    setCurrentSession({
      ...currentSession,
      currentTrack: nextTrack,
    });
    setCurrentTrackProgress(0);
  };

  const voteForTrack = (trackId: string) => {
    // Update track votes
    const updatedPlaylists = playlists.map(playlist => ({
      ...playlist,
      tracks: playlist.tracks.map(track => 
        track.id === trackId 
          ? {...track, votes: track.votes + 1}
          : track
      ),
    }));
    
    setPlaylists(updatedPlaylists);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMoodColor = (mood?: string): string => {
    switch (mood) {
      case 'focus': return MetrTheme.colors.primary.electric;
      case 'energetic': return MetrTheme.colors.primary.pink;
      case 'chill': return MetrTheme.colors.primary.teal;
      case 'creative': return '#F59E0B';
      default: return MetrTheme.colors.dark.textSecondary;
    }
  };

  const renderPlayer = () => {
    if (!currentSession?.currentTrack) return null;
    
    const track = currentSession.currentTrack;
    const progress = (currentTrackProgress / track.duration) * 100;
    
    return (
      <GlassCard style={styles.playerCard}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.1)', 'rgba(20, 184, 166, 0.1)']}
          style={StyleSheet.absoluteFillObject}
        />
        
        <View style={styles.playerHeader}>
          <Image source={{uri: track.albumArt}} style={styles.albumArt} />
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle}>{track.title}</Text>
            <Text style={styles.trackArtist}>{track.artist}</Text>
            <View style={styles.addedBy}>
              <Icon name="account" size={12} color={MetrTheme.colors.dark.textSecondary} />
              <Text style={styles.addedByText}>Added by {track.addedBy}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {width: `${progress}%`}]} />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentTrackProgress)}</Text>
            <Text style={styles.timeText}>{formatTime(track.duration)}</Text>
          </View>
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity>
            <Icon name="skip-previous" size={32} color={MetrTheme.colors.dark.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Icon 
              name={isPlaying ? 'pause' : 'play'} 
              size={36} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={playNextTrack}>
            <Icon name="skip-next" size={32} color={MetrTheme.colors.dark.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.volumeContainer}>
          <Icon name="volume-low" size={20} color={MetrTheme.colors.dark.textSecondary} />
          <View style={styles.volumeBar}>
            <View style={[styles.volumeFill, {width: `${volume}%`}]} />
          </View>
          <Icon name="volume-high" size={20} color={MetrTheme.colors.dark.textSecondary} />
        </View>
        
        {currentSession.syncEnabled && (
          <View style={styles.syncIndicator}>
            <Icon name="sync" size={16} color={MetrTheme.colors.semantic.success} />
            <Text style={styles.syncText}>
              Synced with {currentSession.participants.length} teammates
            </Text>
          </View>
        )}
      </GlassCard>
    );
  };

  const renderPlaylists = () => (
    <View style={styles.playlistsContainer}>
      <Text style={styles.sectionTitle}>Team Playlists</Text>
      
      {playlists.map(playlist => (
        <GlassCard key={playlist.id} style={styles.playlistCard}>
          <TouchableOpacity onPress={() => startListeningSession(playlist)}>
            <View style={styles.playlistHeader}>
              <View style={[styles.moodIndicator, {backgroundColor: getMoodColor(playlist.mood)}]} />
              <View style={styles.playlistInfo}>
                <Text style={styles.playlistName}>{playlist.name}</Text>
                <Text style={styles.playlistDescription}>{playlist.description}</Text>
                <View style={styles.playlistMeta}>
                  <Icon name="music-note" size={14} color={MetrTheme.colors.dark.textSecondary} />
                  <Text style={styles.metaText}>{playlist.tracks.length} tracks</Text>
                  <Icon name="account-group" size={14} color={MetrTheme.colors.dark.textSecondary} />
                  <Text style={styles.metaText}>{playlist.collaborators.length} collaborators</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.playlistPlayButton}>
                <Icon name="play-circle" size={40} color={MetrTheme.colors.primary.electric} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </GlassCard>
      ))}
    </View>
  );

  const renderQueue = () => {
    if (!currentSession) return null;
    
    return (
      <View style={styles.queueContainer}>
        <Text style={styles.sectionTitle}>Up Next</Text>
        
        {currentSession.playlist.tracks.map((track, index) => (
          <View key={track.id} style={styles.queueItem}>
            <Text style={styles.queueNumber}>{index + 1}</Text>
            <Image source={{uri: track.albumArt}} style={styles.queueAlbumArt} />
            <View style={styles.queueTrackInfo}>
              <Text style={styles.queueTrackTitle}>{track.title}</Text>
              <Text style={styles.queueTrackArtist}>{track.artist}</Text>
            </View>
            <TouchableOpacity onPress={() => voteForTrack(track.id)}>
              <View style={styles.voteButton}>
                <Icon name="thumb-up-outline" size={16} color={MetrTheme.colors.primary.teal} />
                <Text style={styles.voteCount}>{track.votes}</Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderMoodSelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodSelector}>
      {['focus', 'energetic', 'chill', 'creative', 'meeting'].map(mood => (
        <TouchableOpacity key={mood} style={styles.moodButton}>
          <LinearGradient
            colors={[getMoodColor(mood) + '40', getMoodColor(mood) + '20']}
            style={styles.moodGradient}
          >
            <Icon 
              name={
                mood === 'focus' ? 'brain' :
                mood === 'energetic' ? 'lightning-bolt' :
                mood === 'chill' ? 'weather-sunset' :
                mood === 'creative' ? 'palette' :
                'account-group'
              }
              size={24}
              color={getMoodColor(mood)}
            />
            <Text style={styles.moodText}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎵 Team Spotify</Text>
        <Text style={styles.subtitle}>Listen together, work better</Text>
      </View>
      
      {renderMoodSelector()}
      {renderPlayer()}
      
      {currentSession ? renderQueue() : renderPlaylists()}
      
      <TouchableOpacity style={styles.createButton}>
        <Icon name="plus" size={20} color="#FFFFFF" />
        <Text style={styles.createButtonText}>Create Team Playlist</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MetrTheme.colors.dark.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: MetrTheme.colors.dark.text,
  },
  subtitle: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 4,
  },
  playerCard: {
    margin: 20,
    padding: 20,
  },
  playerHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  albumArt: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 16,
  },
  trackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  trackArtist: {
    fontSize: 14,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 4,
  },
  addedBy: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addedByText: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: MetrTheme.colors.primary.electric,
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: MetrTheme.colors.primary.electric,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginHorizontal: 12,
  },
  volumeFill: {
    height: '100%',
    backgroundColor: MetrTheme.colors.primary.teal,
    borderRadius: 2,
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  syncText: {
    fontSize: 12,
    color: MetrTheme.colors.semantic.success,
    marginLeft: 6,
  },
  moodSelector: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  moodButton: {
    marginRight: 12,
  },
  moodGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  moodText: {
    fontSize: 12,
    color: MetrTheme.colors.dark.text,
    marginTop: 4,
  },
  playlistsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
    marginBottom: 16,
  },
  playlistCard: {
    padding: 16,
    marginBottom: 12,
  },
  playlistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodIndicator: {
    width: 4,
    height: 60,
    borderRadius: 2,
    marginRight: 16,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    color: MetrTheme.colors.dark.text,
  },
  playlistDescription: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginTop: 2,
  },
  playlistMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
    marginLeft: 4,
    marginRight: 12,
  },
  playlistPlayButton: {
    padding: 8,
  },
  queueContainer: {
    padding: 20,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  queueNumber: {
    width: 20,
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
  },
  queueAlbumArt: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginHorizontal: 12,
  },
  queueTrackInfo: {
    flex: 1,
  },
  queueTrackTitle: {
    fontSize: 14,
    color: MetrTheme.colors.dark.text,
  },
  queueTrackArtist: {
    fontSize: 12,
    color: MetrTheme.colors.dark.textSecondary,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    borderRadius: 16,
  },
  voteCount: {
    fontSize: 12,
    color: MetrTheme.colors.primary.teal,
    marginLeft: 4,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MetrTheme.colors.primary.electric,
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
