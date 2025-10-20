import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, Path, Rect, Text as SvgText } from 'react-native-svg';
import { EPCScores } from '../../utils/epcScoreCalc';
import { getUserState } from '../../utils/storage';
import * as Storage from '../../utils/storage';

// All tools are now pages, no modal imports needed

// Tool state mapping based on TOOL_CONFIG
const toolStateMapping: { [key: string]: 'Maximized' | 'Reserved' | 'Indulgent' | 'Fatigued' } = {
  // Fatigued tools
  'HydrationHero': 'Fatigued',
  'PostItPriority': 'Fatigued',
  'OxygenMask': 'Fatigued',
  'NourishmentCheck': 'Fatigued',
  'PhoneFreePause': 'Fatigued',
  
  // Indulgent tools
  'PleasurePlaylist': 'Indulgent',
  'MentalUnload': 'Indulgent',
  'ConnectionSpark': 'Indulgent',
  'SweetSpotScan': 'Indulgent',
  
  // Reserved tools
  'BoundaryBuilder': 'Reserved',
  'ScheduleScrub': 'Reserved',
  'EnergyBudgetCheck': 'Reserved',
  'GratitudeGuardrail': 'Reserved',
  
  // Maximized tools
  'CapacityAudit': 'Maximized',
  'RecoveryRitual': 'Maximized',
  'TeachItForward': 'Maximized',
  'AimReview': 'Maximized',
};

const toolsData = [
  // Fatigued
  { id: 'HydrationHero', name: 'Hydration Hero', description: 'Boost your physical battery.', image: <Svg width={120} height={140} viewBox="0 0 120 140">
  <Path
    fill="none"
    stroke="#000"
    strokeWidth="3"
    d="M30,20 L90,20 L85,120 Q80,130 60,130 Q40,130 35,120 L30,20 Z"
  />
  <Path
    fill="none"
    stroke="#000"
    strokeWidth="3"
    d="M35,120 Q60,125 85,120"
  />
  <Defs>
    <ClipPath id="glassClip">
      <Path d="M36,26 L84,26 L81,118 Q78,126 60,126 Q42,126 39,118 L36,26 Z" />
    </ClipPath>
  </Defs>
  <Rect
    x="35"
    y="25"
    width="50"
    height="105"
    fill="#4ECDC4"
    opacity="0.6"
    clipPath="url(#glassClip)"
  />
  <Path
    fill="#4ECDC4"
    opacity="0.8"
    d="M36,26 Q48,24 60,26 Q72,28 84,26 L84,28 Q72,30 60,28 Q48,26 36,28 Z"
    clipPath="url(#glassClip)"
  />
</Svg> },
  { id: 'PostItPriority', name: 'Post-it Priority', description: 'Create simple clarity.', image: <Svg width={248} height={100} viewBox="0 0 248 100">
  <Rect x="1.5" y="20" width="75" height="60" rx="10" ry="10" fill="#FF6B6B" stroke="#000" strokeWidth="3" />
  <Rect x="86.5" y="20" width="75" height="60" rx="10" ry="10" fill="#4ECDC4" stroke="#000" strokeWidth="3" />
  <Rect x="171.5" y="20" width="75" height="60" rx="10" ry="10" fill="#45B7D1" stroke="#000" strokeWidth="3" />
</Svg> },
  { id: 'OxygenMask', name: 'The Oxygen Mask', description: 'Stop everything. Breathe.', image: <Svg width={180} height={180} viewBox="0 0 180 180">
  <Rect x={40} y={60} rx={24} ry={24} width={100} height={70} fill="#0EA5E9" />
  <Circle cx={90} cy={95} r={18} fill="#38BDF8" />
  <Path d="M40 90 C 20 80, 20 60, 40 50" stroke="#0EA5E9" strokeWidth={12} fill="none" />
  <Path d="M140 90 C 160 80, 160 60, 140 50" stroke="#0EA5E9" strokeWidth={12} fill="none" />
  <Path d="M62 68 C 82 58, 108 58, 118 68" stroke="#7DD3FC" strokeWidth={6} fill="none" />
</Svg> },
  { id: 'NourishmentCheck', name: 'Nourishment Check', description: 'Restore with mindful fuel.', image: <Svg width={100} height={100} viewBox="0 0 180 180">
  <Path d="M 90 30 C 55 10, 20 40, 20 80 C 20 120, 50 160, 90 160 C 130 160, 160 120, 160 80 C 160 40, 125 10, 90 30 Z"
        fill="#EF4444" stroke="#000000" strokeWidth={6} />
  <Path d="M 90 30 L 95 10 L 105 15 L 100 35 Z" fill="#000000" />
  <Path d="M 100 35 Q 115 20, 130 35 Q 115 50, 100 35 Z" fill="#22C55E" />
</Svg> },
  // { id: 'FreshAirFix', name: 'Fresh Air Fix', description: 'Boost oxygen, shift mindset.', image: require('../../assets/images/toolsimg.png') },
  { id: 'PhoneFreePause', name: 'Phone-Free Pause', description: 'Clear the static.', image: <Svg width={120} height={140} viewBox="0 0 120 140">
  <Rect
    x="30"
    y="20"
    width="60"
    height="100"
    rx="8"
    fill="#333"
    stroke="#000"
    strokeWidth="2"
  />
  <Rect
    x="35"
    y="30"
    width="50"
    height="70"
    rx="4"
    fill="#4A90E2"
  />
  <Rect
    x="55"
    y="110"
    width="10"
    height="10"
    rx="5"
    fill="#666"
  />
</Svg> },
  // Indulgent
  { id: 'PleasurePlaylist', name: 'Pleasure Playlist', description: 'Activate joy to restore.', image: <Svg width={120} height={120} viewBox="0 0 120 120">
  <Circle cx="60" cy="60" r="50" fill="#FACC15" />
  <Path
    d="M70 40 L70 80 Q65 85 60 85 Q55 85 50 80 L50 40"
    stroke="#000"
    strokeWidth="4"
    fill="none"
  />
  <Circle cx="50" cy="80" r="5" fill="#000" />
  <Path
    d="M70 40 L90 30 L90 70 L70 80"
    fill="#000"
    stroke="#000"
    strokeWidth="2"
  />
</Svg> },
  { id: 'MentalUnload', name: 'Mental Unload', description: 'Reduce mental clutter.', image: <Svg width={140} height={140} viewBox="0 0 140 140">
  <Path
    fill="#F3F4F6"
    stroke="#000"
    strokeWidth="2"
    d="M70,20 C50,20 35,35 35,55 C35,65 40,75 50,80 C45,85 40,95 40,105 C40,115 50,125 70,125 C90,125 100,115 100,105 C100,95 95,85 90,80 C100,75 105,65 105,55 C105,35 90,20 70,20 Z"
  />
  <Path
    fill="none"
    stroke="#000"
    strokeWidth="1.5"
    d="M45,30 Q70,25 95,30 M45,40 Q70,35 95,40 M45,50 Q70,45 95,50 M45,60 Q70,55 95,60 M45,70 Q70,65 95,70 M45,80 Q70,75 95,80 M45,90 Q70,85 95,90 M45,100 Q70,95 95,100"
  />
  <Circle cx="25" cy="35" r="8" fill="#E5E7EB" stroke="#000" strokeWidth="1"/>
  <Circle cx="20" cy="25" r="5" fill="#E5E7EB" stroke="#000" strokeWidth="1"/>
  <Circle cx="15" cy="18" r="3" fill="#E5E7EB" stroke="#000" strokeWidth="1"/>
  <Circle cx="115" cy="45" r="8" fill="#E5E7EB" stroke="#000" strokeWidth="1"/>
  <Circle cx="120" cy="35" r="5" fill="#E5E7EB" stroke="#000" strokeWidth="1"/>
  <Circle cx="125" cy="28" r="3" fill="#E5E7EB" stroke="#000" strokeWidth="1"/>
  <Rect x="65" y="90" width="10" height="20" rx="5" fill="#000"/>
  <Circle cx="70" cy="85" r="8" fill="#000"/>
  <Path
    fill="#000"
    d="M70,75 L70,70 M65,70 L75,70"
  />
</Svg> },
  { id: 'ConnectionSpark', name: 'Connection Spark', description: 'Rekindle relational energy.', image: <Svg width={140} height={140} viewBox="0 0 140 140">
  <Path
    fill="#FF6B6B"
    stroke="#000"
    strokeWidth="2"
    d="M70,120 C70,120 20,80 20,50 C20,30 35,15 70,15 C105,15 120,30 120,50 C120,80 70,120 70,120 Z"
  />
  <Path
    fill="#FF8E8E"
    d="M70,120 C70,120 35,85 35,55 C35,40 45,30 70,30 C95,30 105,40 105,55 C105,85 70,120 70,120 Z"
  />
  <Path
    fill="none"
    stroke="#FFD93D"
    strokeWidth="3"
    strokeLinecap="round"
    d="M70,10 L70,5 M60,15 L55,10 M80,15 L85,10 M50,25 L45,20 M90,25 L95,20 M40,40 L35,35 M100,40 L105,35"
  />
  <Circle cx="45" cy="45" r="3" fill="#FFD93D"/>
  <Circle cx="95" cy="45" r="3" fill="#FFD93D"/>
  <Circle cx="60" cy="25" r="2" fill="#FFD93D"/>
  <Circle cx="80" cy="25" r="2" fill="#FFD93D"/>
  <Path
    fill="none"
    stroke="#4ECDC4"
    strokeWidth="2"
    strokeDasharray="5,5"
    d="M30,80 Q50,70 70,80 Q90,70 110,80"
  />
</Svg> },
  { id: 'SweetSpotScan', name: 'Sweet Spot Scan', description: 'Reflect and refocus.', image: <Svg width={140} height={140} viewBox="0 0 140 140">
  <Path
    fill="none"
    stroke="#000"
    strokeWidth="4"
    d="M100,40 L120,20 M120,20 L130,20 M120,20 L120,30"
  />
  <Circle cx="70" cy="70" r="50" fill="none" stroke="#000" strokeWidth="4"/>
  <Path
    fill="#FFD93D"
    d="M70,50 L75,65 L90,65 L78,75 L83,90 L70,80 L57,90 L62,75 L50,65 L65,65 Z"
  />
  <Circle cx="45" cy="45" r="4" fill="#FFD93D"/>
  <Circle cx="95" cy="45" r="3" fill="#FFD93D"/>
  <Circle cx="45" cy="95" r="3" fill="#FFD93D"/>
  <Circle cx="95" cy="95" r="4" fill="#FFD93D"/>
  <Path
    fill="none"
    stroke="#4ECDC4"
    strokeWidth="2"
    strokeDasharray="3,3"
    d="M70,20 L70,10 M70,120 L70,130 M20,70 L10,70 M130,70 L140,70"
  />
</Svg> },
  // Reserved
  { id: 'BoundaryBuilder', name: 'Boundary Builder', description: 'Protect your ‘yes’ by practicing ‘no.’', image: <Svg width={120} height={120} viewBox="0 0 120 120">
  <Path
    d="M60 10 C30 10 20 30 20 60 C20 90 40 110 60 110 C80 110 100 90 100 60 C100 30 90 10 60 10 Z"
    fill="#2563EB"
    stroke="#000"
    strokeWidth="3"
  />
  <Path
    d="M60 20 L60 90 M45 40 L75 40 M45 60 L75 60 M45 80 L75 80"
    stroke="#E0F2FE"
    strokeWidth="3"
    strokeLinecap="round"
  />
</Svg> },
  { id: 'ScheduleScrub', name: 'Schedule Scrub', description: 'Make space to breathe.', image: <Svg width={140} height={140} viewBox="0 0 140 140">
  <Rect x="25" y="35" width="90" height="80" rx="15" fill="#F3F4F6" stroke="#000" strokeWidth="2"/>
  <Rect x="25" y="25" width="90" height="15" rx="5" fill="#000" />
  <Circle cx="45" cy="32" r="3" fill="#FFF"/>
  <Circle cx="95" cy="32" r="3" fill="#FFF"/>
  <Path d="M105,65 L125,45 Q130,40 135,45 L135,55 Q130,60 125,65 Z" fill="#4ECDC4" stroke="#000" strokeWidth="1.5" />
  <Rect x="120" y="48" width="10" height="30" rx="3" fill="#666666"/>
  <Rect x="123" y="50" width="8" height="26" fill="#888888"/>
  <SvgText x="50" y="70" fill="#000" fontSize="18" fontWeight="bold">24</SvgText>
  <SvgText x="60" y="88" fill="#000" fontSize="12">Tasks</SvgText>
</Svg> },
  { id: 'EnergyBudgetCheck', name: 'Energy Budget Check', description: 'Notice where your effort is going.', image: <Svg width={120} height={120} viewBox="0 0 120 120">
  <Circle cx="60" cy="60" r="55" fill="#FF6B6B" stroke="#000000" strokeWidth={6} />
  <Path
    d="M40 45 L80 45 M40 60 L80 60 M40 75 L80 75"
    stroke="#000000"
    strokeWidth={4}
    strokeLinecap="round"
  />
  <Circle cx="35" cy="45" r="3" fill="#22C55E" />
  <Circle cx="35" cy="60" r="3" fill="#EF4444" />
  <Circle cx="35" cy="75" r="3" fill="#6B7280" />
</Svg> },
  { id: 'GratitudeGuardrail', name: 'Gratitude Guardrail', description: 'Fortify your perspective.', image: <Svg width={120} height={120} viewBox="0 0 120 120">
  <Circle cx="60" cy="60" r="55" fill="#8B5CF6" stroke="#000000" strokeWidth={6} />
  <Path
    d="M45 50 Q60 35 75 50 Q60 65 45 50"
    fill="#FCD34D"
    stroke="#000000"
    strokeWidth={2}
  />
  <Path
    d="M60 35 L60 25 M55 30 L65 30"
    stroke="#000000"
    strokeWidth={3}
    strokeLinecap="round"
  />
</Svg> },
  // Maximized
  { id: 'CapacityAudit', name: 'Capacity Audit', description: 'Avoid overcommitment.', image: <Svg width={120} height={120} viewBox="0 0 120 120">
  <Circle cx="60" cy="60" r="55" fill="#10B981" stroke="#000000" strokeWidth={6} />
  <Rect x="35" y="40" width="50" height="8" rx="4" fill="#000000" />
  <Rect x="35" y="55" width="40" height="8" rx="4" fill="#000000" />
  <Rect x="35" y="70" width="45" height="8" rx="4" fill="#000000" />
  <Circle cx="45" cy="44" r="2" fill="#10B981" />
  <Circle cx="45" cy="59" r="2" fill="#10B981" />
  <Circle cx="45" cy="74" r="2" fill="#10B981" />
</Svg> },
  { id: 'RecoveryRitual', name: 'Recovery Ritual', description: 'Wind down with intention.', image: <Svg width={120} height={120} viewBox="0 0 120 120">
  <Circle cx="60" cy="60" r="55" fill="#F59E0B" stroke="#000000" strokeWidth={6} />
  <Path
    d="M40 50 L80 50 M40 65 L80 65 M40 80 L80 80"
    stroke="#000000"
    strokeWidth={3}
    strokeLinecap="round"
  />
  <Circle cx="35" cy="50" r="3" fill="#10B981" />
  <Circle cx="35" cy="65" r="3" fill="#10B981" />
  <Circle cx="35" cy="80" r="3" fill="#10B981" />
  <Path
    d="M85 45 L95 45 L90 55 Z"
    fill="#000000"
  />
</Svg> },
  { id: 'TeachItForward', name: 'Teach It Forward', description: 'Solidify growth by sharing it.', image: <Svg width={120} height={120} viewBox="0 0 120 120">
  <Circle cx="60" cy="60" r="55" fill="#06B6D4" stroke="#000000" strokeWidth={6} />
  <Path
    d="M35 50 L85 50 M35 65 L85 65 M35 80 L85 80"
    stroke="#000000"
    strokeWidth={3}
    strokeLinecap="round"
  />
  <Path
    d="M90 45 L100 45 L95 55 Z"
    fill="#000000"
  />
  <Path
    d="M25 45 L35 45 L30 55 Z"
    fill="#000000"
  />
</Svg> },
  { id: 'AimReview', name: 'Aim Review', description: 'Reconnect with your “why.”', image: <Svg width={120} height={120} viewBox="0 0 120 120">
  <Circle cx="60" cy="60" r="55" fill="#F97316" stroke="#000000" strokeWidth={6} />
  <Circle cx="60" cy="60" r="15" fill="#000000" />
  <Circle cx="60" cy="60" r="8" fill="#F97316" />
  <Path
    d="M60 25 L60 35 M60 85 L60 95 M25 60 L35 60 M85 60 L95 60"
    stroke="#000000"
    strokeWidth={3}
    strokeLinecap="round"
  />
</Svg> },
];

export default function ToolsScreen() {
  const [userState, setUserState] = useState<'Maximized' | 'Reserved' | 'Indulgent' | 'Fatigued' | null>(null);
  const [filteredTools, setFilteredTools] = useState(toolsData);
  const [userName, setUserName] = useState<string>('');
  const [profileInitials, setProfileInitials] = useState<string>('');
  const [epcScores, setEpcScores] = useState<EPCScores | null>(null);
  
  const router = useRouter();

  // Function to load user data and extract first name
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('current_user');
      if (userData) {
        const user = JSON.parse(userData);
        // Extract first name from full name
        const firstName = user.name ? user.name.split(' ')[0] : '';
        setUserName(firstName);
        // Compute initials from full name or email
        const fullName: string = user.name || '';
        const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
        let initials = '';
        if (nameParts.length > 0) {
          initials = nameParts[0]?.[0] || '';
          if (nameParts.length > 1) initials += nameParts[1]?.[0] || '';
        } else if (user.email) {
          initials = user.email[0] || '';
        }
        setProfileInitials(initials.toUpperCase());
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Function to load EPC scores
  const loadEPCScores = async () => {
    try {
      const scores = await Storage.getEPCScores();
      setEpcScores(scores);
    } catch (error) {
      console.error('Error loading EPC scores:', error);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load user state and filter tools
        const state = await getUserState();
        setUserState(state);
        
        // Filter tools based on user state
        if (state) {
          const filtered = toolsData.filter(tool => toolStateMapping[tool.id] === state);
          setFilteredTools(filtered);
        } else {
          // If no user state, show all tools
          setFilteredTools(toolsData);
        }
        
        // Load user data and EPC scores
        await loadUserData();
        await loadEPCScores();
      } catch (error) {
        console.error('Error loading initial data:', error);
        // Fallback to showing all tools
        setFilteredTools(toolsData);
      }
    };

    loadInitialData();
  }, []);
  
  const handleToolPress = (toolId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Navigate to pages for all tools
    if (toolId === 'HydrationHero') {
      router.push('/hydration-hero');
    } else if (toolId === 'PostItPriority') {
      router.push('/post-it-priority');
    } else if (toolId === 'OxygenMask') {
      router.push('/oxygen-mask-get-started');
    } else if (toolId === 'NourishmentCheck') {
      router.push('/nourishment-check');
    // } else if (toolId === 'FreshAirFix') {
    //   router.push('/fresh-air-fix');
    } else if (toolId === 'PhoneFreePause') {
      router.push('/phone-free-pause');
    } else if (toolId === 'PleasurePlaylist') {
      router.push('/pleasure-playlist');
    } else if (toolId === 'MentalUnload') {
      router.push('/mental-unload');
    } else if (toolId === 'ConnectionSpark') {
      router.push('/connection-spark');
    } else if (toolId === 'SweetSpotScan') {
      router.push('/sweet-spot-scan');
    } else if (toolId === 'BoundaryBuilder') {
      router.push('/boundary-builder');
    } else if (toolId === 'ScheduleScrub') {
      router.push('/schedule-scrub');
    } else if (toolId === 'EnergyBudgetCheck') {
      router.push('/energy-budget-check');
    } else if (toolId === 'GratitudeGuardrail') {
      router.push('/gratitude-guardrail');
    } else if (toolId === 'CapacityAudit') {
      router.push('/capacity-audit');
    } else if (toolId === 'RecoveryRitual') {
      router.push('/recovery-ritual');
    } else if (toolId === 'TeachItForward') {
      router.push('/teach-it-forward');
    } else if (toolId === 'AimReview') {
      router.push('/aim-review');
    }
  };

  // No longer need closeModal or renderModal functions

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(200)}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Tools</Text>
          <Text style={styles.subtitle}>
            {userState ? `Tools for ${userState} state` : 'Features and accessories that add more comfort, convenience and security to your work.'}
          </Text>
        </View>
        
        {/* Settings button */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (epcScores) {
              router.push({
                pathname: '/epc-explanation-profile',
                params: { scores: JSON.stringify(epcScores) }
              });
            }
          }}
          activeOpacity={0.8}
          style={styles.profileIconAbsolute}
        >
          <LinearGradient
            colors={['#D1D1D6', '#8E8E93']} // Subtle gradient from lighter to darker grey
            style={{ width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={styles.profileInitials}>{profileInitials || 'U'}</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.content}>
          <View style={styles.toolsGrid}>
            {filteredTools.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={styles.toolCard}
                onPress={() => handleToolPress(tool.id)}
                activeOpacity={0.8}
              >
                <View style={styles.toolImageContainer}>
                  {typeof tool.image === 'string' ? (
                    <Image
                      source={tool.image}
                      style={styles.toolImage}
                      resizeMode="contain"
                    />
                  ) : (
                    tool.image
                  )}
                </View>
                <View style={styles.toolInfo}>
                  <Text style={styles.toolName}>{tool.name}</Text>
                  <Text style={styles.toolDescription}>{tool.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
      {/* No longer need renderModal() */}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FA',
    paddingTop: 0,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#8E8E93',
    lineHeight: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  toolsGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  toolCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 280,
  },
  toolImageContainer: {
    width: '100%',
    height: 200, // Reduced image height
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolImage: {
    width: '100%',
    height: '100%',
  },
  toolInfo: {
    alignItems: 'flex-start',
  },
  toolName: {
    fontSize: 20, // Adjusted font size
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  toolDescription: {
    fontSize: 16, // Adjusted font size
    fontWeight: '400',
    color: '#8E8E93',
    lineHeight: 22,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  bottomSpacing: {
    height: 100,
  },
  profileIconAbsolute: {
    position: 'absolute',
    top: 52,
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  profileInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
}); 