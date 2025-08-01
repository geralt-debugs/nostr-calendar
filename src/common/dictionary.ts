export type NestedObject = Record<string, NestedObject | string>;

const dictionary: NestedObject = {
  "en-US": {
    navigation: {
      today: "today",
      previousDay: "Previous day",
      previousWeek: "Previous week",
      previousMonth: "Previous month",
      nextDay: "Next day",
      nextWeek: "Next week",
      nextMonth: "Next month",
      next: "next",
      day: "Day",
      week: "Week",
      month: "Month",
      year: "Year",
      login: "Log In",
      logout: "Log Out",
      save: "Save",
      timeSelectorPlaceholder: "Time",
      description: "Desciption",
      location: "Location",
    },
  },
  "de-DE": {
    navigation: {
      today: "Heute",
      previousDay: "Vortag",
      previousWeek: "Vorwoche",
      previousMonth: "Vormonat",
      nextDay: "Morgen",
      nextWeek: "nächste Woche",
      nextMonth: "nächster Monat",
      previous: "vorhergehend",
      next: "nächster",
      day: "Tag",
      week: "Woche",
      month: "Monat",
      year: "Jahr",
      login: "anmelden",
      logout: "abmelden",
      timeSelectorPlaceholder: "Zeit",
      save: "speichern",
      description: "Beschreibung",
      location: "Ort",
    },
  },
};
export default dictionary;
