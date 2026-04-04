export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      dependencies: {
        Row: {
          created_at: string
          dependency_count: number | null
          dependency_path: string[] | null
          deprecated: string | null
          depth: number | null
          description: string | null
          dev_dependency_count: number | null
          has_install_scripts: boolean | null
          homepage: string | null
          id: string
          is_dev_dependency: boolean | null
          is_direct_dependency: boolean | null
          last_published: string | null
          license: string | null
          name: string
          repository: string | null
          risk_level: Database["public"]["Enums"]["severity_level"] | null
          risk_score: number | null
          scan_id: string
          version: string
          weekly_downloads: number | null
        }
        Insert: {
          created_at?: string
          dependency_count?: number | null
          dependency_path?: string[] | null
          deprecated?: string | null
          depth?: number | null
          description?: string | null
          dev_dependency_count?: number | null
          has_install_scripts?: boolean | null
          homepage?: string | null
          id?: string
          is_dev_dependency?: boolean | null
          is_direct_dependency?: boolean | null
          last_published?: string | null
          license?: string | null
          name: string
          repository?: string | null
          risk_level?: Database["public"]["Enums"]["severity_level"] | null
          risk_score?: number | null
          scan_id: string
          version: string
          weekly_downloads?: number | null
        }
        Update: {
          created_at?: string
          dependency_count?: number | null
          dependency_path?: string[] | null
          deprecated?: string | null
          depth?: number | null
          description?: string | null
          dev_dependency_count?: number | null
          has_install_scripts?: boolean | null
          homepage?: string | null
          id?: string
          is_dev_dependency?: boolean | null
          is_direct_dependency?: boolean | null
          last_published?: string | null
          license?: string | null
          name?: string
          repository?: string | null
          risk_level?: Database["public"]["Enums"]["severity_level"] | null
          risk_score?: number | null
          scan_id?: string
          version?: string
          weekly_downloads?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dependencies_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      maintainers: {
        Row: {
          created_at: string
          dependency_id: string
          email: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          dependency_id: string
          email?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          dependency_id?: string
          email?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintainers_dependency_id_fkey"
            columns: ["dependency_id"]
            isOneToOne: false
            referencedRelation: "dependencies"
            referencedColumns: ["id"]
          },
        ]
      }
      scans: {
        Row: {
          created_at: string
          critical_vulnerabilities: number
          direct_dependencies: number
          high_vulnerabilities: number
          id: string
          lockfile_content: string | null
          low_vulnerabilities: number
          medium_vulnerabilities: number
          overall_risk_grade: Database["public"]["Enums"]["risk_grade"]
          overall_risk_score: number
          package_json: string
          progress: number
          project_name: string
          scanned_packages: number
          status: Database["public"]["Enums"]["scan_status"]
          total_dependencies: number
          total_packages: number
          transitive_dependencies: number
          updated_at: string
          weak_link_signals: number
        }
        Insert: {
          created_at?: string
          critical_vulnerabilities?: number
          direct_dependencies?: number
          high_vulnerabilities?: number
          id?: string
          lockfile_content?: string | null
          low_vulnerabilities?: number
          medium_vulnerabilities?: number
          overall_risk_grade?: Database["public"]["Enums"]["risk_grade"]
          overall_risk_score?: number
          package_json: string
          progress?: number
          project_name: string
          scanned_packages?: number
          status?: Database["public"]["Enums"]["scan_status"]
          total_dependencies?: number
          total_packages?: number
          transitive_dependencies?: number
          updated_at?: string
          weak_link_signals?: number
        }
        Update: {
          created_at?: string
          critical_vulnerabilities?: number
          direct_dependencies?: number
          high_vulnerabilities?: number
          id?: string
          lockfile_content?: string | null
          low_vulnerabilities?: number
          medium_vulnerabilities?: number
          overall_risk_grade?: Database["public"]["Enums"]["risk_grade"]
          overall_risk_score?: number
          package_json?: string
          progress?: number
          project_name?: string
          scanned_packages?: number
          status?: Database["public"]["Enums"]["scan_status"]
          total_dependencies?: number
          total_packages?: number
          transitive_dependencies?: number
          updated_at?: string
          weak_link_signals?: number
        }
        Relationships: []
      }
      vulnerabilities: {
        Row: {
          affected_versions: string | null
          created_at: string
          cvss_score: number | null
          cwe_ids: string[] | null
          dependency_id: string
          description: string | null
          id: string
          patched_versions: string | null
          published_date: string | null
          reference_urls: string[] | null
          severity: Database["public"]["Enums"]["severity_level"]
          source: string
          source_id: string
          title: string
        }
        Insert: {
          affected_versions?: string | null
          created_at?: string
          cvss_score?: number | null
          cwe_ids?: string[] | null
          dependency_id: string
          description?: string | null
          id?: string
          patched_versions?: string | null
          published_date?: string | null
          reference_urls?: string[] | null
          severity: Database["public"]["Enums"]["severity_level"]
          source: string
          source_id: string
          title: string
        }
        Update: {
          affected_versions?: string | null
          created_at?: string
          cvss_score?: number | null
          cwe_ids?: string[] | null
          dependency_id?: string
          description?: string | null
          id?: string
          patched_versions?: string | null
          published_date?: string | null
          reference_urls?: string[] | null
          severity?: Database["public"]["Enums"]["severity_level"]
          source?: string
          source_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "vulnerabilities_dependency_id_fkey"
            columns: ["dependency_id"]
            isOneToOne: false
            referencedRelation: "dependencies"
            referencedColumns: ["id"]
          },
        ]
      }
      weak_links: {
        Row: {
          created_at: string
          dependency_id: string
          details: string | null
          id: string
          message: string
          severity: Database["public"]["Enums"]["severity_level"]
          signal_type: string
        }
        Insert: {
          created_at?: string
          dependency_id: string
          details?: string | null
          id?: string
          message: string
          severity: Database["public"]["Enums"]["severity_level"]
          signal_type: string
        }
        Update: {
          created_at?: string
          dependency_id?: string
          details?: string | null
          id?: string
          message?: string
          severity?: Database["public"]["Enums"]["severity_level"]
          signal_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "weak_links_dependency_id_fkey"
            columns: ["dependency_id"]
            isOneToOne: false
            referencedRelation: "dependencies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      maintainers_public: {
        Row: {
          created_at: string | null
          dependency_id: string | null
          id: string | null
          name: string | null
        }
        Insert: {
          created_at?: string | null
          dependency_id?: string | null
          id?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string | null
          dependency_id?: string | null
          id?: string | null
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintainers_dependency_id_fkey"
            columns: ["dependency_id"]
            isOneToOne: false
            referencedRelation: "dependencies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      risk_grade: "A" | "B" | "C" | "D" | "F"
      scan_status: "pending" | "scanning" | "completed" | "failed"
      severity_level: "critical" | "high" | "medium" | "low" | "info"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      risk_grade: ["A", "B", "C", "D", "F"],
      scan_status: ["pending", "scanning", "completed", "failed"],
      severity_level: ["critical", "high", "medium", "low", "info"],
    },
  },
} as const
