import React from "react";
import { Linking, View } from "react-native";
import { NButton } from "./NButton";
import { NText } from "./NText";
import { MEDICAL_DISCLAIMER, legalLinks } from "@/lib/legal";
import { Spacing } from "@/lib/theme";

export function MedicalDisclaimer({
  center = false,
  showLinks = false,
}: {
  center?: boolean;
  showLinks?: boolean;
}) {
  const links = showLinks ? legalLinks() : [];

  return (
    <View style={{ marginTop: Spacing.md }}>
      <NText variant="caption1" muted center={center}>
        {MEDICAL_DISCLAIMER}
      </NText>
      {links.length > 0 && (
        <View style={{ marginTop: Spacing.sm, alignItems: center ? "center" : "flex-start" }}>
          {links.map((link) => (
            <NButton
              key={link.url}
              title={link.label}
              variant="ghost"
              size="sm"
              onPress={() => {
                Linking.openURL(link.url).catch(() => {});
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
