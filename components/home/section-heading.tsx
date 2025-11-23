import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type SectionHeadingProps = {
  title: string;
  description: string;
  descriptionColor: string;
};

export function SectionHeading({ title, description, descriptionColor }: SectionHeadingProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedText style={[styles.description, { color: descriptionColor }]}>
        {description}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  description: {
    fontSize: 16,
  },
});
