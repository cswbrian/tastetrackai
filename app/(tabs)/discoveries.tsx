import { DiscoveryCard } from '@/components/discovery/DiscoveryCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DiscoveriesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { discoveries, isLoading, error, fetchDiscoveries } = useDiscoveryStore();

  useEffect(() => {
    fetchDiscoveries();
  }, [fetchDiscoveries]);

  const handleRefresh = () => {
    fetchDiscoveries();
  };

  const handleCreateDiscovery = () => {
    router.push('/(tabs)/create');
  };

  const handleDiscoveryPress = (discoveryId: string) => {
    // Future: Navigate to discovery detail screen
    console.log('Navigate to discovery:', discoveryId);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons
        name="auto-awesome"
        size={64}
        color={Colors[colorScheme ?? 'light'].tabIconDefault}
      />
      <Text style={[styles.emptyStateTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
        No discoveries yet
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
        Start documenting your discoveries by tapping the + button
      </Text>
      <TouchableOpacity style={styles.createFirstButton} onPress={handleCreateDiscovery}>
        <MaterialIcons name="add" size={20} color="white" />
        <Text style={styles.createFirstButtonText}>Create Your First Discovery</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDiscovery = ({ item }: { item: any }) => (
    <DiscoveryCard
      discovery={item}
      onPress={() => handleDiscoveryPress(item.id)}
    />
  );

  if (isLoading && discoveries.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading discoveries...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Discoveries
        </Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateDiscovery}>
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Discoveries List */}
      <FlatList
        data={discoveries}
        renderItem={renderDiscovery}
        keyExtractor={(item) => item.id}
        contentContainerStyle={discoveries.length === 0 ? styles.emptyListContainer : styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={Colors[colorScheme ?? 'light'].tint}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      {discoveries.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleCreateDiscovery}>
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: Colors.light.tint,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: Colors.light.tint,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
