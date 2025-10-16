import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const features = [
    {
        icon: '⚡',
        title: 'EPC Scoring System',
        description: 'Track your Energy, Purpose & Connection with real-time updates'
    },
    {
        icon: '🧠',
        title: 'AI-Powered Wellness Tasks',
        description: 'Personalized daily tasks based on your capacity assessment'
    },
    {
        icon: '🛠️',
        title: '20+ Wellness Tools',
        description: 'Hydration tracking, boundary building, recovery rituals & more'
    },
    {
        icon: '📊',
        title: 'Smart Energy Decay',
        description: 'Automatic background energy tracking with sleep protection'
    },
    {
        icon: '🎯',
        title: 'Capacity Assessment',
        description: 'Understand if you\'re Maximized, Reserved, Indulgent, or Fatigued'
    },
    {
        icon: '📱',
        title: 'Health App Integration',
        description: 'Connect Apple Health, Spotify, and other wellness apps'
    },
    {
        icon: '🔄',
        title: 'Real-Time Updates',
        description: 'Live EPC score changes with buffer and tail effects'
    },
    {
        icon: '🎨',
        title: 'Beautiful UI',
        description: 'Modern, intuitive design with smooth animations'
    }
];

export default function SubscriptionScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsLoading(true);
        
        // Simulate subscription process
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert(
                'Welcome to Premium! 🎉',
                'You now have access to all wellness features. Let\'s start your journey!',
                [
                    {
                        text: 'Get Started',
                        onPress: () => router.replace('/(tabs)/home')
                    }
                ]
            );
        }, 2000);
    };

    const handleSkip = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.replace('/(tabs)/home');
    };

    const FeatureCard = ({ feature, index }: { feature: typeof features[0], index: number }) => (
        <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>{feature.icon}</Text>
            </View>
            <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Unlock Your Full Potential</Text>
                    <Text style={styles.subtitle}>
                        Get unlimited access to all wellness features and transform your daily life
                    </Text>
                </View>

                {/* Pricing Card */}
                <View style={styles.pricingCard}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.currency}>$</Text>
                        <Text style={styles.price}>9.99</Text>
                        <Text style={styles.period}>/month</Text>
                    </View>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Most Popular</Text>
                    </View>
                </View>

                {/* Features Section */}
                <View style={styles.featuresSection}>
                    <Text style={styles.featuresTitle}>Everything You Get:</Text>
                    
                    <View style={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <FeatureCard key={index} feature={feature} index={index} />
                        ))}
                    </View>
                </View>

                {/* Benefits Section */}
                <View style={styles.benefitsSection}>
                    <View style={styles.benefitItem}>
                        <Text style={styles.benefitIcon}>✅</Text>
                        <Text style={styles.benefitText}>Cancel anytime, no questions asked</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Text style={styles.benefitIcon}>✅</Text>
                        <Text style={styles.benefitText}>7-day free trial to test everything</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Text style={styles.benefitIcon}>✅</Text>
                        <Text style={styles.benefitText}>Sync across all your devices</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.subscribeButton, isLoading && styles.subscribeButtonDisabled]}
                    onPress={handleSubscribe}
                    disabled={isLoading}
                >
                    <Text style={styles.subscribeButtonText}>
                        {isLoading ? 'Processing...' : 'Start Free Trial - $9.99/month'}
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.skipButton}
                    onPress={handleSkip}
                >
                    <Text style={styles.skipButtonText}>Start Free Trial</Text>
                </TouchableOpacity>
                
                <Text style={styles.disclaimer}>
                    By subscribing, you agree to our Terms of Service and Privacy Policy
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8FA',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 200, // Space for fixed footer
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 50,
        paddingBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1C1C1E',
        textAlign: 'left',
        marginBottom: 12,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#8E8E93',
        textAlign: 'left',
        lineHeight: 22,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    pricingCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 24,
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        position: 'relative',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 16,
    },
    currency: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    price: {
        fontSize: 48,
        fontWeight: '800',
        color: '#1C1C1E',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    period: {
        fontSize: 18,
        fontWeight: '600',
        color: '#8E8E93',
        marginLeft: 4,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    badge: {
        backgroundColor: '#4ECDC4',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        position: 'absolute',
        top: -12,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    featuresSection: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    featuresTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 20,
        textAlign: 'left',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    featuresGrid: {
        gap: 16,
    },
    featureCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    featureIconText: {
        fontSize: 24,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 4,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    featureDescription: {
        fontSize: 14,
        fontWeight: '500',
        color: '#8E8E93',
        lineHeight: 20,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    benefitsSection: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 24,
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    benefitIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    benefitText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
        flex: 1,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F8F8FA',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 50,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    subscribeButton: {
        backgroundColor: '#000000',
        paddingVertical: 18,
        borderRadius: 28,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    subscribeButtonDisabled: {
        opacity: 0.7,
    },
    subscribeButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    skipButton: {
        alignItems: 'center',
        marginBottom: 16,
    },
    skipButtonText: {
        color: '#8E8E93',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    disclaimer: {
        fontSize: 12,
        fontWeight: '500',
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 16,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
});
