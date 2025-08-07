import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Discovery } from '@/types/discovery';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 32;
const IMAGE_HEIGHT = 200;

interface DiscoveryCardProps {
  discovery: Discovery;
  onPress?: () => void;
}

const categoryConfig = {
  liked_it: {
    label: 'Liked It',
    color: '#4CAF50',
    icon: 'favorite',
  },
  didnt_like_it: {
    label: "Didn't Like It",
    color: '#F44336',
    icon: 'favorite-border',
  },
  want_to_try: {
    label: 'Want to Try',
    color: '#FF9800',
    icon: 'star',
  },
};

const discoveryTypeConfig = {
  book: { label: 'Book', icon: 'book' },
  music: { label: 'Music', icon: 'music-note' },
  movie: { label: 'Movie', icon: 'movie' },
  food: { label: 'Food', icon: 'restaurant' },
  drink: { label: 'Drink', icon: 'local-cafe' },
  place: { label: 'Place', icon: 'place' },
  product: { label: 'Product', icon: 'inventory' },
};

export function DiscoveryCard({ discovery, onPress }: DiscoveryCardProps) {
  const colorScheme = useColorScheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const category = categoryConfig[discovery.category];
  const type = discovery.discovery_type ? discoveryTypeConfig[discovery.discovery_type as keyof typeof discoveryTypeConfig] : null;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderImages = () => {
    if (!discovery.images || discovery.images.length === 0) {
      return null;
    }

    return (
      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
            setCurrentImageIndex(index);
          }}
        >
          {discovery.images.map((image, index) => (
            <View key={image.id} style={styles.imageWrapper}>
              <Image
                source={{ uri: image.image_url }}
                style={styles.image}
                contentFit="cover"
                transition={200}
              />
            </View>
          ))}
        </ScrollView>
        
        {discovery.images.length > 1 && (
          <View style={styles.imageIndicator}>
            {discovery.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicatorDot,
                  {
                    backgroundColor: index === currentImageIndex 
                      ? Colors[colorScheme ?? 'light'].tint 
                      : 'rgba(255, 255, 255, 0.5)',
                  },
                ]}
              />
            ))}
          </View>
        )}
        
        {discovery.images.length > 1 && (
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1} / {discovery.images.length}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: Colors[colorScheme ?? 'light'].background },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {renderImages()}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.categoryContainer}>
            <MaterialIcons
              name={category.icon as any}
              size={16}
              color="white"
            />
            <Text style={[styles.categoryText, { color: category.color }]}>
              {category.label}
            </Text>
          </View>
          
          {type && (
            <View style={styles.typeContainer}>
              <MaterialIcons
                name={type.icon as any}
                size={14}
                color={Colors[colorScheme ?? 'light'].text}
              />
              <Text style={[styles.typeText, { color: Colors[colorScheme ?? 'light'].text }]}>
                {type.label}
              </Text>
            </View>
          )}
        </View>
        
        {discovery.text_content && (
          <Text
            style={[styles.textContent, { color: Colors[colorScheme ?? 'light'].text }]}
            numberOfLines={3}
          >
            {discovery.text_content}
          </Text>
        )}
        
        <View style={styles.footer}>
          <View style={styles.metadata}>
            <Text style={[styles.timestamp, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
              {formatDate(discovery.created_at)}
            </Text>
            
            {discovery.location_name && (
              <View style={styles.locationContainer}>
                <MaterialIcons
                  name="place"
                  size={12}
                  color={Colors[colorScheme ?? 'light'].tabIconDefault}
                />
                <Text style={[styles.locationText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                  {discovery.location_name}
                </Text>
              </View>
            )}
          </View>
          
          {discovery.images && discovery.images.length > 0 && (
            <View style={styles.imageCount}>
              <MaterialIcons
                name="photo"
                size={14}
                color={Colors[colorScheme ?? 'light'].tabIconDefault}
              />
              <Text style={[styles.imageCountText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                {discovery.images.length}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: IMAGE_HEIGHT,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  imageCounter: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  textContent: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metadata: {
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  imageCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageCountText: {
    fontSize: 12,
    marginLeft: 4,
  },
});
