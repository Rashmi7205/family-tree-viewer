
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TreeViewer } from "@/components/family-tree/tree-viewer";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  SkipForward,
  RotateCcw,
  Users,
  GitBranch,
  Share2,
  MousePointer,
  Eye,
} from "lucide-react";

const demoFamilyTree = {
  id: "demo",
  name: "The Johnson Family Tree",
  description:
    "A hierarchical family tree showcasing parent-child relationships with proper generational levels",
  shareLink: "demo-link",
  isPublic: true,
  members: [
    // Generation 1 (Great-Grandparents)
    {
      id: "1",
      firstName: "William",
      lastName: "Johnson",
      birthDate: "1895-03-12",
      deathDate: "1978-11-20",
      gender: "Male",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "Patriarch of the Johnson family. Railroad engineer who helped build the transcontinental railway.",
    },
    {
      id: "2",
      firstName: "Eleanor",
      lastName: "Johnson",
      birthDate: "1898-07-08",
      deathDate: "1982-04-15",
      gender: "Female",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "Matriarch and William's devoted wife. Seamstress who ran a successful tailoring business.",
    },

    // Generation 2 (Grandparents) - William & Eleanor's children
    {
      id: "3",
      firstName: "Robert",
      lastName: "Johnson",
      birthDate: "1920-01-15",
      deathDate: "1995-06-20",
      gender: "Male",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "Eldest son who served in World War II as a medic. Became a respected family doctor.",
    },
    {
      id: "4",
      firstName: "Margaret",
      lastName: "Johnson",
      birthDate: "1922-05-22",
      deathDate: "1998-12-10",
      gender: "Female",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "Second child who became a teacher and principal. Passionate about education.",
    },
    {
      id: "5",
      firstName: "James",
      lastName: "Johnson",
      birthDate: "1924-09-30",
      deathDate: "2001-03-18",
      gender: "Male",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "Third son who became a successful farmer and businessman.",
    },

    // Generation 2 Spouses
    {
      id: "6",
      firstName: "Mary",
      lastName: "Johnson",
      birthDate: "1925-03-10",
      deathDate: "2000-12-05",
      gender: "Female",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "Robert's wife and registered nurse. Worked alongside her husband in his medical practice.",
    },
    {
      id: "7",
      firstName: "Helen",
      lastName: "Johnson",
      birthDate: "1928-06-18",
      deathDate: "2005-01-30",
      gender: "Female",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "James's wife who managed the household and farm finances.",
    },

    // Generation 3 (Parents) - Robert & Mary's children
    {
      id: "8",
      firstName: "Michael",
      lastName: "Johnson",
      birthDate: "1945-07-22",
      gender: "Male",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "Robert's eldest son who followed in his father's footsteps as a doctor. Specializes in pediatrics.",
    },
    {
      id: "9",
      firstName: "Susan",
      lastName: "Johnson",
      birthDate: "1947-11-30",
      gender: "Female",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "Robert's daughter who became a registered nurse and later a hospital administrator.",
    },

    // Generation 3 - James & Helen's children
    {
      id: "10",
      firstName: "William",
      lastName: "Johnson",
      birthDate: "1952-05-10",
      gender: "Male",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "James's eldest son who took over the family farm. Modernized operations with sustainable farming.",
    },
    {
      id: "11",
      firstName: "Nancy",
      lastName: "Johnson",
      birthDate: "1954-09-15",
      gender: "Female",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "James's daughter who became a chef and restaurant owner specializing in farm-to-table cuisine.",
    },

    // Generation 3 Spouses
    {
      id: "12",
      firstName: "Jennifer",
      lastName: "Johnson",
      birthDate: "1948-04-20",
      gender: "Female",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "Michael's wife who works as a school counselor. They have been married for 45 years.",
    },
    {
      id: "13",
      firstName: "David",
      lastName: "Johnson",
      birthDate: "1950-08-15",
      gender: "Male",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "Susan's husband who works as an engineer. They met in college and have been together ever since.",
    },

    // Generation 4 (Current Generation) - Michael & Jennifer's children
    {
      id: "14",
      firstName: "Emily",
      lastName: "Johnson",
      birthDate: "1975-08-14",
      gender: "Female",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "Michael's daughter who became a pediatric surgeon. Specializes in complex heart surgeries for children.",
    },
    {
      id: "15",
      firstName: "Christopher",
      lastName: "Johnson",
      birthDate: "1978-02-20",
      gender: "Male",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "Michael's son who became a medical researcher working on breakthrough treatments for childhood diseases.",
    },

    // Generation 4 - Susan & David's children
    {
      id: "16",
      firstName: "Matthew",
      lastName: "Johnson",
      birthDate: "1972-05-16",
      gender: "Male",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "Susan's son who became a hospital administrator focusing on improving healthcare accessibility.",
    },
    {
      id: "17",
      firstName: "Sarah",
      lastName: "Johnson",
      birthDate: "1975-09-22",
      gender: "Female",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "Susan's daughter who became a nurse practitioner running a community health clinic.",
    },

    // Generation 4 - William's children
    {
      id: "18",
      firstName: "Robert",
      lastName: "Johnson",
      birthDate: "1980-04-12",
      gender: "Male",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "William's eldest son who is taking over the family farm operations with sustainable techniques.",
    },
    {
      id: "19",
      firstName: "Lisa",
      lastName: "Johnson",
      birthDate: "1982-08-28",
      gender: "Female",
      profileImageUrl: "/placeholder.svg?height=100&width=100",
      bio: "William's daughter who manages the farm's agritourism business and educational programs.",
    },
  ],
  relationships: [
    // Generation 1 Marriage (William & Eleanor)
    {
      id: "r1",
      member1Id: "1",
      member2Id: "2",
      relationshipType: "spouse",
      member1: { id: "1", firstName: "William", lastName: "Johnson" },
      member2: { id: "2", firstName: "Eleanor", lastName: "Johnson" },
    },

    // Generation 1 to 2 (William & Eleanor's children)
    {
      id: "r2",
      member1Id: "1",
      member2Id: "3",
      relationshipType: "parent",
      member1: { id: "1", firstName: "William", lastName: "Johnson" },
      member2: { id: "3", firstName: "Robert", lastName: "Johnson" },
    },
    {
      id: "r3",
      member1Id: "2",
      member2Id: "3",
      relationshipType: "parent",
      member1: { id: "2", firstName: "Eleanor", lastName: "Johnson" },
      member2: { id: "3", firstName: "Robert", lastName: "Johnson" },
    },
    {
      id: "r4",
      member1Id: "1",
      member2Id: "4",
      relationshipType: "parent",
      member1: { id: "1", firstName: "William", lastName: "Johnson" },
      member2: { id: "4", firstName: "Margaret", lastName: "Johnson" },
    },
    {
      id: "r5",
      member1Id: "2",
      member2Id: "4",
      relationshipType: "parent",
      member1: { id: "2", firstName: "Eleanor", lastName: "Johnson" },
      member2: { id: "4", firstName: "Margaret", lastName: "Johnson" },
    },
    {
      id: "r6",
      member1Id: "1",
      member2Id: "5",
      relationshipType: "parent",
      member1: { id: "1", firstName: "William", lastName: "Johnson" },
      member2: { id: "5", firstName: "James", lastName: "Johnson" },
    },
    {
      id: "r7",
      member1Id: "2",
      member2Id: "5",
      relationshipType: "parent",
      member1: { id: "2", firstName: "Eleanor", lastName: "Johnson" },
      member2: { id: "5", firstName: "James", lastName: "Johnson" },
    },

    // Generation 2 Siblings
    {
      id: "r8",
      member1Id: "3",
      member2Id: "4",
      relationshipType: "sibling",
      member1: { id: "3", firstName: "Robert", lastName: "Johnson" },
      member2: { id: "4", firstName: "Margaret", lastName: "Johnson" },
    },
    {
      id: "r9",
      member1Id: "3",
      member2Id: "5",
      relationshipType: "sibling",
      member1: { id: "3", firstName: "Robert", lastName: "Johnson" },
      member2: { id: "5", firstName: "James", lastName: "Johnson" },
    },
    {
      id: "r10",
      member1Id: "4",
      member2Id: "5",
      relationshipType: "sibling",
      member1: { id: "4", firstName: "Margaret", lastName: "Johnson" },
      member2: { id: "5", firstName: "James", lastName: "Johnson" },
    },

    // Generation 2 Marriages
    {
      id: "r11",
      member1Id: "3",
      member2Id: "6",
      relationshipType: "spouse",
      member1: { id: "3", firstName: "Robert", lastName: "Johnson" },
      member2: { id: "6", firstName: "Mary", lastName: "Johnson" },
    },
    {
      id: "r12",
      member1Id: "5",
      member2Id: "7",
      relationshipType: "spouse",
      member1: { id: "5", firstName: "James", lastName: "Johnson" },
      member2: { id: "7", firstName: "Helen", lastName: "Johnson" },
    },

    // Generation 2 to 3 (Robert & Mary's children)
    {
      id: "r13",
      member1Id: "3",
      member2Id: "8",
      relationshipType: "parent",
      member1: { id: "3", firstName: "Robert", lastName: "Johnson" },
      member2: { id: "8", firstName: "Michael", lastName: "Johnson" },
    },
    {
      id: "r14",
      member1Id: "6",
      member2Id: "8",
      relationshipType: "parent",
      member1: { id: "6", firstName: "Mary", lastName: "Johnson" },
      member2: { id: "8", firstName: "Michael", lastName: "Johnson" },
    },
    {
      id: "r15",
      member1Id: "3",
      member2Id: "9",
      relationshipType: "parent",
      member1: { id: "3", firstName: "Robert", lastName: "Johnson" },
      member2: { id: "9", firstName: "Susan", lastName: "Johnson" },
    },
    {
      id: "r16",
      member1Id: "6",
      member2Id: "9",
      relationshipType: "parent",
      member1: { id: "6", firstName: "Mary", lastName: "Johnson" },
      member2: { id: "9", firstName: "Susan", lastName: "Johnson" },
    },

    // Generation 2 to 3 (James & Helen's children)
    {
      id: "r17",
      member1Id: "5",
      member2Id: "10",
      relationshipType: "parent",
      member1: { id: "5", firstName: "James", lastName: "Johnson" },
      member2: { id: "10", firstName: "William", lastName: "Johnson" },
    },
    {
      id: "r18",
      member1Id: "7",
      member2Id: "10",
      relationshipType: "parent",
      member1: { id: "7", firstName: "Helen", lastName: "Johnson" },
      member2: { id: "10", firstName: "William", lastName: "Johnson" },
    },
    {
      id: "r19",
      member1Id: "5",
      member2Id: "11",
      relationshipType: "parent",
      member1: { id: "5", firstName: "James", lastName: "Johnson" },
      member2: { id: "11", firstName: "Nancy", lastName: "Johnson" },
    },
    {
      id: "r20",
      member1Id: "7",
      member2Id: "11",
      relationshipType: "parent",
      member1: { id: "7", firstName: "Helen", lastName: "Johnson" },
      member2: { id: "11", firstName: "Nancy", lastName: "Johnson" },
    },

    // Generation 3 Siblings
    {
      id: "r21",
      member1Id: "8",
      member2Id: "9",
      relationshipType: "sibling",
      member1: { id: "8", firstName: "Michael", lastName: "Johnson" },
      member2: { id: "9", firstName: "Susan", lastName: "Johnson" },
    },
    {
      id: "r22",
      member1Id: "10",
      member2Id: "11",
      relationshipType: "sibling",
      member1: { id: "10", firstName: "William", lastName: "Johnson" },
      member2: { id: "11", firstName: "Nancy", lastName: "Johnson" },
    },

    // Generation 3 Marriages
    {
      id: "r23",
      member1Id: "8",
      member2Id: "12",
      relationshipType: "spouse",
      member1: { id: "8", firstName: "Michael", lastName: "Johnson" },
      member2: { id: "12", firstName: "Jennifer", lastName: "Johnson" },
    },
    {
      id: "r24",
      member1Id: "9",
      member2Id: "13",
      relationshipType: "spouse",
      member1: { id: "9", firstName: "Susan", lastName: "Johnson" },
      member2: { id: "13", firstName: "David", lastName: "Johnson" },
    },

    // Generation 3 to 4 (Michael & Jennifer's children)
    {
      id: "r25",
      member1Id: "8",
      member2Id: "14",
      relationshipType: "parent",
      member1: { id: "8", firstName: "Michael", lastName: "Johnson" },
      member2: { id: "14", firstName: "Emily", lastName: "Johnson" },
    },
    {
      id: "r26",
      member1Id: "12",
      member2Id: "14",
      relationshipType: "parent",
      member1: { id: "12", firstName: "Jennifer", lastName: "Johnson" },
      member2: { id: "14", firstName: "Emily", lastName: "Johnson" },
    },
    {
      id: "r27",
      member1Id: "8",
      member2Id: "15",
      relationshipType: "parent",
      member1: { id: "8", firstName: "Michael", lastName: "Johnson" },
      member2: { id: "15", firstName: "Christopher", lastName: "Johnson" },
    },
    {
      id: "r28",
      member1Id: "12",
      member2Id: "15",
      relationshipType: "parent",
      member1: { id: "12", firstName: "Jennifer", lastName: "Johnson" },
      member2: { id: "15", firstName: "Christopher", lastName: "Johnson" },
    },

    // Generation 3 to 4 (Susan & David's children)
    {
      id: "r29",
      member1Id: "9",
      member2Id: "16",
      relationshipType: "parent",
      member1: { id: "9", firstName: "Susan", lastName: "Johnson" },
      member2: { id: "16", firstName: "Matthew", lastName: "Johnson" },
    },
    {
      id: "r30",
      member1Id: "13",
      member2Id: "16",
      relationshipType: "parent",
      member1: { id: "13", firstName: "David", lastName: "Johnson" },
      member2: { id: "16", firstName: "Matthew", lastName: "Johnson" },
    },
    {
      id: "r31",
      member1Id: "9",
      member2Id: "17",
      relationshipType: "parent",
      member1: { id: "9", firstName: "Susan", lastName: "Johnson" },
      member2: { id: "17", firstName: "Sarah", lastName: "Johnson" },
    },
    {
      id: "r32",
      member1Id: "13",
      member2Id: "17",
      relationshipType: "parent",
      member1: { id: "13", firstName: "David", lastName: "Johnson" },
      member2: { id: "17", firstName: "Sarah", lastName: "Johnson" },
    },

    // Generation 3 to 4 (William's children)
    {
      id: "r33",
      member1Id: "10",
      member2Id: "18",
      relationshipType: "parent",
      member1: { id: "10", firstName: "William", lastName: "Johnson" },
      member2: { id: "18", firstName: "Robert", lastName: "Johnson" },
    },
    {
      id: "r34",
      member1Id: "10",
      member2Id: "19",
      relationshipType: "parent",
      member1: { id: "10", firstName: "William", lastName: "Johnson" },
      member2: { id: "19", firstName: "Lisa", lastName: "Johnson" },
    },

    // Generation 4 Siblings
    {
      id: "r35",
      member1Id: "14",
      member2Id: "15",
      relationshipType: "sibling",
      member1: { id: "14", firstName: "Emily", lastName: "Johnson" },
      member2: { id: "15", firstName: "Christopher", lastName: "Johnson" },
    },
    {
      id: "r36",
      member1Id: "16",
      member2Id: "17",
      relationshipType: "sibling",
      member1: { id: "16", firstName: "Matthew", lastName: "Johnson" },
      member2: { id: "17", firstName: "Sarah", lastName: "Johnson" },
    },
    {
      id: "r37",
      member1Id: "18",
      member2Id: "19",
      relationshipType: "sibling",
      member1: { id: "18", firstName: "Robert", lastName: "Johnson" },
      member2: { id: "19", firstName: "Lisa", lastName: "Johnson" },
    },
  ],
};

const interactionSteps = [
  {
    title: "Hierarchical Family Tree Structure",
    description:
      "Explore the proper generational hierarchy with parents above children",
    component: "intro",
    instructions: [
      "Parents appear above their children in the tree",
      "Siblings and spouses appear on the same level",
      "Clear generational separation with connecting lines",
      "Only 4 relationship types: Parent, Child, Spouse, Sibling",
    ],
  },
  {
    title: "Relationship Types",
    description: "Understanding the 4 core family relationship types",
    component: "relationships",
    instructions: [
      "👨‍👩‍👧‍👦 Parent-Child: Vertical hierarchy",
      "💑 Spouse: Horizontal connection",
      "👫 Sibling: Same generation level",
      "🔗 Clear connecting lines show relationships",
    ],
  },
  {
    title: "Generational Levels",
    description: "See how generations are properly organized",
    component: "generations",
    instructions: [
      "🏛️ Generation 1: Great-grandparents at top",
      "👴 Generation 2: Grandparents below",
      "👨‍👩 Generation 3: Parents in middle",
      "👶 Generation 4: Children at bottom",
    ],
  },
  {
    title: "Interactive Tree Navigation",
    description: "Navigate through the hierarchical family structure",
    component: "navigation",
    instructions: [
      "🖱️ Click and drag to explore the tree",
      "🔍 Zoom to see relationship details",
      "📱 Touch-friendly on mobile devices",
      "🎯 Reset view to see full hierarchy",
    ],
  },
];

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOwnerView, setIsOwnerView] = useState(false);

  const nextStep = () => {
    if (currentStep < interactionSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const startAutoPlay = () => {
    setIsPlaying(true);
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= interactionSteps.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return 0;
        }
        return prev + 1;
      });
    }, 5000);
  };

  const handleMemberUpdate = async (member: any) => {
    console.log("Demo: Would update member", member);
  };

  const handleMemberDelete = async (memberId: string) => {
    console.log("Demo: Would delete member", memberId);
  };

  const currentStepData = interactionSteps[currentStep];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Hierarchical Family Tree Demo
              </h1>
              <p className="text-gray-600">
                Experience proper generational hierarchy with 4 core
                relationship types
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={startAutoPlay}
                disabled={isPlaying}
              >
                <Play className="h-4 w-4 mr-2" />
                {isPlaying ? "Playing..." : "Auto Tour"}
              </Button>
              <Button variant="outline" onClick={resetDemo}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Instruction Panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Hierarchy Guide
                  </CardTitle>
                  <CardDescription>
                    Step {currentStep + 1} of {interactionSteps.length}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {currentStepData.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {currentStepData.description}
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Key Features:
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-2">
                        {currentStepData.instructions.map(
                          (instruction, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-600 mt-0.5">•</span>
                              <span>{instruction}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    {/* Relationship Types Legend */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">
                        Relationship Types:
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-purple-800">
                            Parent → Child (Vertical)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                          <span className="text-purple-800">
                            Spouse (Horizontal)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-purple-800">
                            Sibling (Same Level)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span className="text-purple-800">
                            Child → Parent (Reverse)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Owner/Visitor Toggle */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">
                        View Mode:
                      </h4>
                      <Button
                        size="sm"
                        variant={isOwnerView ? "default" : "outline"}
                        onClick={() => setIsOwnerView(!isOwnerView)}
                        className="w-full"
                      >
                        {isOwnerView ? "👑 Owner View" : "👁️ Visitor View"}
                      </Button>
                      <p className="text-xs text-green-700 mt-2">
                        {isOwnerView
                          ? "Edit buttons visible on member cards"
                          : "Read-only view for visitors"}
                      </p>
                    </div>

                    {/* Progress Indicators */}
                    <div className="space-y-2">
                      {interactionSteps.map((step, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                            index === currentStep
                              ? "bg-blue-100 text-blue-800"
                              : index < currentStep
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                          onClick={() => setCurrentStep(index)}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === currentStep
                                ? "bg-blue-600 text-white"
                                : index < currentStep
                                ? "bg-green-600 text-white"
                                : "bg-gray-400 text-white"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">
                            {step.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="flex-1"
                      >
                        Previous
                      </Button>
                      <Button size="sm" onClick={nextStep} className="flex-1">
                        <SkipForward className="h-4 w-4 mr-1" />
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Tree View */}
            <div className="lg:col-span-3">
              {currentStepData.component === "intro" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hierarchical Family Tree Structure</CardTitle>
                    <CardDescription>
                      Proper generational hierarchy with 4 core relationship
                      types and connecting lines
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          Hierarchical Structure
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">
                                Generational Levels
                              </h4>
                              <p className="text-sm text-gray-600">
                                Parents above children, proper hierarchy
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <GitBranch className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">Connecting Lines</h4>
                              <p className="text-sm text-gray-600">
                                Visual lines showing family relationships
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <MousePointer className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">
                                4 Relationship Types
                              </h4>
                              <p className="text-sm text-gray-600">
                                Parent, Child, Spouse, Sibling only
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Tree Features</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Eye className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">Clear Hierarchy</h4>
                              <p className="text-sm text-gray-600">
                                Easy to understand family structure
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                              <Share2 className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">
                                Interactive Navigation
                              </h4>
                              <p className="text-sm text-gray-600">
                                Zoom, pan, and explore the tree
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">
                        The Johnson Family Hierarchy
                      </h3>
                      <p className="text-gray-700 mb-4">
                        This family tree demonstrates proper hierarchical
                        structure with 4 generations. Each generation is clearly
                        separated, with parents positioned above their children
                        and connecting lines showing relationships. Spouses and
                        siblings appear on the same level, making family
                        connections easy to understand.
                      </p>
                      <div className="flex gap-4 text-sm flex-wrap">
                        <Badge variant="secondary">19 Family Members</Badge>
                        <Badge variant="secondary">37 Relationships</Badge>
                        <Badge variant="secondary">4 Generations</Badge>
                        <Badge variant="secondary">4 Relationship Types</Badge>
                        <Badge variant="secondary">
                          Hierarchical Structure
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tree Viewer for all other steps */}
              {currentStepData.component !== "intro" && (
                <div className="space-y-4">
                  {currentStep === 1 && (
                    <Card className="border-purple-200 bg-purple-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-purple-800">
                          <GitBranch className="h-5 w-5" />
                          <span className="font-semibold">
                            Relationship Types Active
                          </span>
                        </div>
                        <p className="text-sm text-purple-700 mt-1">
                          Notice the 4 core relationship types: Parent (vertical
                          down), Child (vertical up), Spouse (horizontal), and
                          Sibling (same level).
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {currentStep === 2 && (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-green-800">
                          <Users className="h-5 w-5" />
                          <span className="font-semibold">
                            Generational Levels Active
                          </span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          See how each generation is properly positioned:
                          Great-grandparents at top, then grandparents, parents,
                          and children below.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <TreeViewer
                    familyTree={demoFamilyTree}
                    isPublic={!isOwnerView}
                    isOwner={isOwnerView}
                    onMemberUpdate={handleMemberUpdate}
                    onMemberDelete={handleMemberDelete}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Interactive Tips */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>🏗️ Hierarchical Tree Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Parent Relationships
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Parents appear above children</li>
                      <li>• Vertical connecting lines</li>
                      <li>• Clear generational hierarchy</li>
                      <li>• Both parents connected to child</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">
                      Spouse Relationships
                    </h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Spouses on same level</li>
                      <li>• Horizontal connecting lines</li>
                      <li>• Marriage partnerships</li>
                      <li>• Side-by-side positioning</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">
                      Sibling Relationships
                    </h4>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Siblings on same generation</li>
                      <li>• Horizontal connections</li>
                      <li>• Same parent relationships</li>
                      <li>• Equal positioning</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">
                      Child Relationships
                    </h4>
                    <ul className="text-sm text-orange-800 space-y-1">
                      <li>• Children below parents</li>
                      <li>• Reverse parent relationship</li>
                      <li>• Next generation down</li>
                      <li>• Connected to both parents</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
