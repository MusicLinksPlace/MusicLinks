import React, { useState, useMemo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { REGIONS_DEPARTMENTS, DEPARTMENTS_OUTRE_MER } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';

interface LocationFilterProps {
  selectedLocation: string | null;
  onLocationChange: (location: string) => void;
}

export function LocationFilter({ selectedLocation, onLocationChange }: LocationFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRegions = useMemo(() => {
    if (!searchTerm) return REGIONS_DEPARTMENTS;
    const lowerCaseSearch = searchTerm.toLowerCase();

    return REGIONS_DEPARTMENTS.map(region => {
      const filteredDepartments = region.departments.filter(dept => 
        dept.toLowerCase().includes(lowerCaseSearch)
      );
      // Include region if its name matches or if it has matching departments
      if (region.name.toLowerCase().includes(lowerCaseSearch) || filteredDepartments.length > 0) {
        // If the region name matches, show all its departments
        return { ...region, departments: region.name.toLowerCase().includes(lowerCaseSearch) ? region.departments : filteredDepartments };
      }
      return null;
    }).filter((region): region is typeof REGIONS_DEPARTMENTS[0] => region !== null);
  }, [searchTerm]);

  const filteredDoms = useMemo(() => {
    if (!searchTerm) return DEPARTMENTS_OUTRE_MER;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return DEPARTMENTS_OUTRE_MER.filter(dom => dom.name.toLowerCase().includes(lowerCaseSearch));
  }, [searchTerm]);


  const handleSelect = (location: string) => {
    onLocationChange(location);
  };

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Région, département..."
            className="w-full h-10 pl-9 bg-gray-100 border-gray-100 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-grow" style={{ height: 'calc(95vh - 150px)' }}>
        <div className="p-2">
          {filteredRegions.length > 0 && (
             <Accordion type="single" collapsible className="w-full">
              {filteredRegions.map((region) => (
                <AccordionItem value={region.name} key={region.name} className="border-b-0">
                  <AccordionTrigger className="px-3 py-3 text-lg font-medium hover:bg-gray-100 rounded-md">
                    {region.name}
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <ul className="pl-7 pr-2 py-1">
                      {region.departments.map((dept) => (
                        <li key={dept}>
                          <button
                            onClick={() => handleSelect(dept === 'Toute la région' ? region.name : dept)}
                            className={`w-full text-left px-3 py-2.5 text-base rounded-md ${selectedLocation === (dept === 'Toute la région' ? region.name : dept) ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-gray-50'}`}
                          >
                            {dept}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
          
          {filteredDoms.length > 0 && (
            <>
              <hr className="my-2" />
              <h3 className="text-base font-semibold text-gray-500 px-4 my-2">DOM-TOM</h3>
              <ul>
                {filteredDoms.map((dom) => (
                  <li key={dom.name}>
                    <button
                      onClick={() => handleSelect(dom.name)}
                      className={`w-full text-left px-5 py-3 text-lg font-medium rounded-md ${selectedLocation === dom.name ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-gray-50'}`}
                    >
                      {dom.name}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

           {filteredRegions.length === 0 && filteredDoms.length === 0 && (
            <p className="text-center text-gray-500 py-10">Aucun résultat trouvé.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 